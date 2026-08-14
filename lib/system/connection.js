// WhatsApp connection setup: zapo-js WaClient wrapped as a Baileys-shaped
// facade (conn.ev / conn._client / conn.authState / conn.sendMessage, ...)
// so handler.js and lib/simple.js's attach() keep working unmodified.
// Ported from the project's own TS branch:
// https://github.com/BOTCAHX/RTXZY-MD/blob/zapo-ts/main.ts
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import chalk from 'chalk';
import QRCode from 'qrcode';
import { WaClient, createStore, createNoopLogger } from 'zapo-js';
import { createSqliteStore } from '@zapo-js/store-sqlite';
import { createMediaProcessor } from '@zapo-js/media-utils';
import simple, { generateMessageID } from '../simple.js';

global.mediaProcessor = global.mediaProcessor || createMediaProcessor();

// zapo's WaIncomingMessageEvent is a superset-compatible shape of Baileys'
// WebMessageInfo (same .key/.message/.pushName fields) - this just renames
// timestampSeconds -> messageTimestamp.low so smsg()/handler.js don't notice.
function translateMessageEvent(ev) {
  const key = ev.key || {};
  return {
    key: {
      remoteJid: key.remoteJid || ev.chatJid,
      fromMe: !!key.fromMe,
      id: key.id || ev.stanzaId,
      participant: key.participant || ev.participant,
      ...(key.isGroup != null ? { isGroup: key.isGroup } : {}),
      ...(key.participantAlt ? { participantPn: key.participantAlt } : {}),
      ...(key.remoteJidAlt ? { remoteJidPn: key.remoteJidAlt } : {})
    },
    message: ev.message,
    pushName: ev.pushName,
    messageTimestamp: ev.timestampSeconds ? { low: ev.timestampSeconds } : undefined,
    ...(ev.messageStubType != null ? { messageStubType: ev.messageStubType } : {}),
    ...(ev.messageStubParameters ? { messageStubParameters: ev.messageStubParameters } : {})
  };
}

const GROUP_ACTION_MAP = {
  add: 'add',
  remove: 'remove',
  promote: 'promote',
  demote: 'demote',
  linked_group_promote: 'promote',
  linked_group_demote: 'demote',
  invite: 'add',
  change_number: 'remove'
};

// Actions Baileys used to represent as a "stub" system message inside the
// chat (messageStubType/messageStubParameters) rather than a group event.
const GROUP_STUB_MAP = {
  subject: { type: 21, params: (ev) => [ev.subject] },
  invite: { type: 23, params: (ev) => [ev.code] },
  revoke_invite: { type: 23, params: (ev) => [ev.code] },
  description: { type: 24, params: (ev) => [ev.description] },
  restrict: { type: 25, params: (ev) => [ev.enabled ? 'on' : 'off'] },
  announce: { type: 26, params: (ev) => [ev.enabled ? 'on' : 'off'] }
};

const CROCKFORD_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTVWXYZ';
function sanitizePairingCode(code) {
  if (!code) return undefined;
  const stripped = String(code)
    .replace(/-/g, '')
    .toUpperCase()
    .split('')
    .filter((c) => CROCKFORD_ALPHABET.includes(c))
    .join('');
  return stripped.length === 8 ? stripped : undefined;
}

function stubMessage(gid, authorJid, stubType, stubParameters) {
  return {
    key: {
      remoteJid: gid,
      fromMe: false,
      id: generateMessageID(),
      ...(authorJid ? { participant: authorJid } : {})
    },
    message: { conversation: '' },
    pushName: '',
    messageTimestamp: { low: Math.floor(Date.now() / 1000) },
    messageStubType: stubType,
    messageStubParameters: stubParameters
  };
}

// Builds a zapo-js WaClient and wraps it in a plain object shaped like a
// Baileys socket (conn.ev/.authState/.user/.ws/...), translating every
// zapo-js event into the Baileys dot-event names lib/simple.js/handler.js
// already listen for. Starts connecting immediately, same as Baileys'
// makeWASocket().
function makeWASocketBase(connectionOptions = {}) {
  const logger = connectionOptions.logger || createNoopLogger();
  if (typeof logger.child !== 'function') logger.child = () => logger;

  const authDir = connectionOptions.authDir || connectionOptions.sessionDir || 'sessions';
  if (!connectionOptions.store) {
    fs.mkdirSync(authDir, { recursive: true });
    const backend = createSqliteStore({ path: path.join(authDir, 'state.sqlite') });
    connectionOptions.store = createStore({
      backends: { sqlite: backend },
      providers: {
        auth: 'sqlite',
        signal: 'sqlite',
        preKey: 'sqlite',
        session: 'sqlite',
        identity: 'sqlite',
        senderKey: 'sqlite',
        appState: 'sqlite',
        privacyToken: 'sqlite',
        messages: 'sqlite',
        threads: 'sqlite',
        contacts: 'sqlite'
      }
    });
  }

  const version = connectionOptions.version ? (Array.isArray(connectionOptions.version) ? connectionOptions.version.join('.') : String(connectionOptions.version)) : undefined;
  const sessionId = connectionOptions.sessionId || connectionOptions.authFile || path.basename(authDir);

  const client = new WaClient(
    {
      store: connectionOptions.store,
      sessionId,
      ...(version ? { version } : {}),
      markOnlineOnConnect: connectionOptions.markOnlineOnConnect ?? true,
      ...(connectionOptions.keepAliveIntervalMs ? { keepAliveIntervalMs: connectionOptions.keepAliveIntervalMs } : {}),
      ...(connectionOptions.deviceBrowser || connectionOptions.browser ? { deviceBrowser: String(connectionOptions.deviceBrowser || connectionOptions.browser).toLowerCase() } : {}),
      ...(connectionOptions.recoverFromClientTooOld != null ? { recoverFromClientTooOld: connectionOptions.recoverFromClientTooOld } : {}),
      ...(global.mediaProcessor ? { media: { processor: global.mediaProcessor, generateThumbnail: true, generateWaveform: true, normalizeVoiceNote: true } } : {})
    },
    logger
  );

  const conn = {};
  conn._client = client;
  conn.ev = new EventEmitter();
  conn.ev.setMaxListeners(0);
  conn.logger = logger;
  conn.isLid = new Map();

  Object.defineProperty(conn, 'user', {
    get() {
      const creds = client.getCredentials();
      if (!creds?.meJid) return null;
      const jid = creds.meJid;
      return {
        id: jid,
        jid,
        name: creds.meDisplayName || creds.pushName || '',
        verifiedName: creds.meDisplayName || '',
        device: jid.split(':')[1]
      };
    },
    configurable: true
  });

  Object.defineProperty(conn, 'authState', {
    get() {
      const state = client.getState ? client.getState() : { registered: false };
      const creds = client.getCredentials();
      return {
        creds: {
          registered: !!(state?.registered ?? !!creds?.meJid),
          me: creds?.meJid ? { id: creds.meJid, lid: creds.meLid } : undefined,
          meLid: creds?.meLid,
          pushName: creds?.meDisplayName || creds?.pushName
        },
        keys: {}
      };
    },
    configurable: true
  });

  conn.ws = {
    readyState: WebSocket.CONNECTING,
    close: () => {
      void client.disconnect().catch(() => {});
    }
  };

  conn.chats = {};

  client.on('connection', (ev) => {
    conn.ws.readyState = ev.status === 'open' ? WebSocket.OPEN : ev.status === 'close' ? WebSocket.CLOSED : WebSocket.CONNECTING;
    if (ev.status === 'open') {
      conn.ev.emit('connection.update', { connection: 'open', isNewLogin: !!ev.isNewLogin, lastDisconnect: undefined });
    } else if (ev.status === 'close') {
      conn.ev.emit('connection.update', {
        connection: 'close',
        isNewLogin: false,
        isLogout: !!ev.isLogout,
        lastDisconnect: { error: new Error(ev.reason || 'connection closed'), reason: ev.reason, code: ev.code }
      });
    } else {
      conn.ev.emit('connection.update', { connection: 'connecting', isNewLogin: false });
    }
  });

  client.on('auth_qr', ({ qr }) => conn.ev.emit('connection.update', { qr }));

  client.on('auth_pairing_required', (ev) => {
    client._zapoPairingReady = true;
    conn.ev.emit('connection.update', { pairingRequired: true, forceManual: !!ev?.forceManual });
  });

  client.on('auth_pairing_code', ({ code }) => conn.ev.emit('connection.update', { pairingCode: code }));

  client.on('auth_paired', ({ credentials }) => conn.ev.emit('creds.update', credentials));

  client.on('message', (ev) => {
    const wmi = translateMessageEvent(ev);
    conn.ev.emit('messages.upsert', { messages: [wmi], type: 'notify' });

    if (ev.pushName) {
      for (const j of [ev.key?.participantAlt, ev.key?.remoteJidAlt, ev.key?.participant, ev.key?.remoteJid]) {
        if (!j || typeof j !== 'string') continue;
        const jd = conn.decodeJid(j);
        if (!jd || jd.endsWith('@g.us') || jd.endsWith('@broadcast') || jd.endsWith('@newsletter')) continue;
        let c = conn.chats[jd];
        if (!c) c = conn.chats[jd] = { id: jd };
        if (!c.name && !c.notify) c.name = ev.pushName;
      }
    }
    if (ev.key?.fromMe) conn.ev.emit('message_send', { messages: [wmi] });
  });

  client.on('message_protocol', (ev) => {
    const pm = ev.protocolMessage;
    if (!pm) return;
    if (pm.type === 0) {
      // REVOKE = 0 in Proto.Message.ProtocolMessage.Type
      const key = pm.key || {};
      conn.ev.emit('message.delete', {
        remoteJid: key.remoteJid || ev.key?.remoteJid,
        fromMe: !!key.fromMe,
        id: key.id,
        participant: key.participant || ev.key?.participant
      });
    }
  });

  client.on('group', (ev) => {
    const gid = ev.groupJid || ev.chatJid;
    const action = GROUP_ACTION_MAP[ev.action];
    if (action && ev.participants?.length) {
      conn.ev.emit('group-participants.update', {
        id: gid,
        participants: ev.participants.map((p) => p.jid || p.lidJid || p.phoneJid).filter(Boolean),
        action,
        author: ev.authorJid
      });
    }
    if (ev.action === 'subject' || ev.action === 'description' || ev.action === 'restrict' || ev.action === 'announce') {
      conn.ev.emit('groups.update', [
        {
          id: gid,
          ...(ev.action === 'subject' ? { subject: ev.subject } : {}),
          ...(ev.action === 'description' ? { desc: ev.description } : {}),
          ...(ev.action === 'restrict' ? { restrict: ev.enabled } : {}),
          ...(ev.action === 'announce' ? { announce: ev.enabled } : {})
        }
      ]);
    }

    const stub = GROUP_STUB_MAP[ev.action];
    if (stub && gid) {
      conn.ev.emit('messages.upsert', {
        messages: [
          stubMessage(
            gid,
            ev.authorJid,
            stub.type,
            stub.params(ev).filter((p) => p != null)
          )
        ],
        type: 'notify'
      });
    }
  });

  client.on('presence', (ev) => {
    const id = ev.chatJid;
    const attrs = ev.rawNode?.attrs || {};
    const sender = attrs.from || id;
    if (!id || !sender) return;
    conn.ev.emit('presence.update', {
      id,
      presences: {
        [sender]: {
          lastKnownPresence: attrs.type || 'available',
          ...(ev.lastSeen?.kind === 'timestamp' ? { lastSeen: ev.lastSeen.unixSeconds } : {})
        }
      }
    });
  });

  client.on('receipt', (ev) => conn.ev.emit('message.receipt.update', ev));
  client.on('chatstate', (ev) => conn.ev.emit('chatstate.update', ev));

  client.on('call', (ev) => {
    conn.ev.emit(
      'call',
      [
        {
          id: ev.callId,
          from: ev.callerPnJid || ev.senderLidJid || ev.callCreatorJid,
          status: ev.type,
          isVideo: ev.isVideo,
          groupJid: ev.groupJid,
          timestamp: ev.timestampSeconds
        }
      ].filter((c) => c.id && c.from)
    );
  });

  client.on('picture', (ev) => {
    conn.ev.emit('picture.update', ev);
    const gid = ev.chatJid || ev.targetJid;
    if (gid && gid.endsWith('@g.us') && ['set', 'delete', 'set_avatar'].includes(ev.action)) {
      conn.ev.emit('messages.upsert', {
        messages: [stubMessage(gid, ev.authorJid, 22, [ev.action])],
        type: 'notify'
      });
    }
  });

  conn.requestPairingCode = async (phoneNumber, customCode) => {
    const state = client.getState ? client.getState() : { registered: false };
    if (!state.registered && !client._zapoPairingReady) {
      void client.connect().catch((e) => logger?.error?.(e));
      await new Promise((resolve) => {
        client.once('auth_pairing_required', () => {
          client._zapoPairingReady = true;
          resolve();
        });
        setTimeout(resolve, 15000);
      });
    }
    return client.auth.requestPairingCode(String(phoneNumber).replace(/\D/g, ''), true, sanitizePairingCode(customCode));
  };

  conn.connect = () => client.connect();
  conn.disconnect = () => client.disconnect();
  conn.logout = (reason) => client.logout(reason);

  conn._store = connectionOptions.store;
  conn._sessionId = sessionId;

  void client.connect().catch((e) => logger?.error?.(e));

  return conn;
}

export function makeSocket(connectionOptions) {
  return simple.attach(makeWASocketBase(connectionOptions));
}

export async function createClient(authFile) {
  const storeSqlitePath = path.join(authFile, 'state.sqlite');
  global.isInit = !fs.existsSync(storeSqlitePath);
  fs.mkdirSync(authFile, { recursive: true });

  // No custom `version` here on purpose - zapo-js ships a tested bundled WA
  // Web version per release. Overriding it with a live-scraped version (as
  // the old Baileys setup did) advertises a client newer than what zapo-js
  // actually implements, which can make pairing look like it succeeds
  // (a valid code comes back) but fail on the phone ("Couldn't link
  // device"). recoverFromClientTooOld covers the case where the bundled
  // version genuinely goes stale.
  const connectionOptions = {
    authDir: authFile,
    sessionId: authFile,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 10000,
    recoverFromClientTooOld: true,
    browser: 'chrome'
  };

  const conn = makeSocket(connectionOptions);
  return { conn, connectionOptions, storeSqlitePath };
}

// The store hydrates credentials asynchronously; give it a moment before
// reading conn.authState so a resumed session isn't mistaken for a fresh one.
async function waitAuthLoaded(conn, timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (conn._client?.getCredentials?.()) return true;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

// Pairing-code (or QR, with --qr) login for a fresh/unregistered session.
// Skips the terminal prompt entirely if config.botNumber is set. Returns the
// conn to use from here on (replaced when a corrupt/empty store is reset).
export async function authenticate(conn, { rl, question, connectionOptions, storeSqlitePath }) {
  await waitAuthLoaded(conn);

  if (conn.authState.creds.registered || conn.authState.creds.me) {
    console.log(chalk.green('-- session found, resuming without pairing --'));
  }

  // A leftover session that never finished pairing is worse than useless -
  // WhatsApp rejects linking against a stale/half-established identity
  // ("Couldn't link device"). Always start from a clean store before asking
  // for a new code, unless this is already a brand-new session.
  if (!global.isInit && !conn.authState.creds.registered && !conn.authState.creds.me) {
    console.log(chalk.yellow('-- no valid session found, resetting local state before pairing --'));
    try {
      conn.ws.close();
    } catch {}
    fs.rmSync(storeSqlitePath, { force: true });
    fs.rmSync(storeSqlitePath + '-shm', { force: true });
    fs.rmSync(storeSqlitePath + '-wal', { force: true });
    conn = makeSocket(connectionOptions);
    global.isInit = true;
  }

  if (conn.authState.creds.registered || conn.authState.creds.me) return conn;

  if (process.argv.includes('--qr')) {
    global.useQR = true;
    console.log(chalk.blueBright('QR Mode is active. Please scan the QR code that will appear below.'));
    rl.close();
    return conn;
  }

  let phoneNumber = (global.config.botNumber || '').replace(/\D/g, '');

  if (phoneNumber.length >= 10) {
    console.log(chalk.blueBright(`Using bot number from config.js: ${phoneNumber}`));
    rl.close();
  } else {
    do {
      phoneNumber = await question(chalk.blueBright('ENTER A VALID NUMBER START WITH REGION CODE. Example : 62xxx:\n'));

      if (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 10) {
        console.log(chalk.red('Invalid phone number. Please enter a valid number.'));
      }
    } while (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 10);

    rl.close();
    phoneNumber = phoneNumber.replace(/\D/g, '');
  }

  console.log(chalk.bgWhite(chalk.blue('-- Please wait, generating code... --')));
  setTimeout(async () => {
    let code = await conn.requestPairingCode(phoneNumber, global.config.pairingCode);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
  }, 3000);

  return conn;
}

export async function connectionUpdate(update) {
  const { connection, isLogout, qr } = update;
  global.timestamp.connect = new Date();

  if (qr && global.useQR) {
    console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
    console.log(chalk.yellow('\nIf the QR code above is too large or distorted, please click the link below to scan it in your browser:'));
    console.log(chalk.blueBright(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}\n`));
  }

  if (connection === 'close' && !isLogout && global.conn.ws.readyState !== WebSocket.CONNECTING) {
    global.reloadHandler(true).catch(console.error);
  }
  if (global.db.data == null) await global.loadDatabase();
}
