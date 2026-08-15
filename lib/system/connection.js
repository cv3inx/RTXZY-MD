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
import log from './log.js';

global.mediaProcessor = global.mediaProcessor || createMediaProcessor();

// zapo's WaIncomingMessageEvent is a superset-compatible shape of Baileys'
// WebMessageInfo (same .key/.message/.pushName fields) - this just renames
// timestampSeconds -> messageTimestamp.low so smsg()/handler.js don't notice.
export function translateMessageEvent(ev) {
  const key = ev.key || {};
  return {
    key: {
      remoteJid: key.remoteJid || ev.chatJid,
      fromMe: !!key.fromMe,
      id: key.id || ev.stanzaId,
      // Di chat pribadi WhatsApp tidak mengirim participant sama sekali —
      // pengarangnya sudah jelas dari remoteJid. Field-nya dihilangkan alih-alih
      // diisi undefined; pakai m.participant kalau butuh pengarang yang selalu
      // terisi.
      ...(key.participant || ev.participant ? { participant: key.participant || ev.participant } : {}),
      ...(key.isGroup != null ? { isGroup: key.isGroup } : {}),
      ...(key.participantAlt ? { participantPn: key.participantAlt } : {}),
      ...(key.remoteJidAlt ? { remoteJidPn: key.remoteJidAlt } : {}),
      // Username WhatsApp pengirim, kalau server melampirkannya. Gratis di
      // sini — tanpa ini satu-satunya cara tahu handle seseorang adalah
      // request usync terpisah.
      ...(key.senderUsername ? { senderUsername: key.senderUsername } : {})
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
      // Dicatat di sini, bukan di connectionUpdate: listener conn.ev baru
      // dipasang setelah semua plugin selesai dimuat, sedangkan koneksi sesi
      // yang sudah tersimpan sering terbuka sebelum itu — kalau menunggu
      // listener, log "tersambung" bisa tidak muncul sama sekali.
      const me = conn.user;
      log.ok(`Tersambung${me?.name ? ` sebagai ${me.name}` : ''}${me?.jid ? ` · +${me.jid.split('@')[0].split(':')[0]}` : ''}`);
      if (ev.isNewLogin) log.ok('Perangkat baru ditautkan, sesi disimpan — restart berikutnya tidak perlu scan lagi');
      conn.ev.emit('connection.update', { connection: 'open', isNewLogin: !!ev.isNewLogin, lastDisconnect: undefined });
    } else if (ev.status === 'close') {
      if (ev.isLogout) log.warn('Sesi di-logout dari perangkat lain');
      else log.warn(`Koneksi terputus${ev.reason ? `: ${ev.reason}` : ''}, menyambung ulang...`);
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

  // Notifikasi MEX: perubahan username kontak, sinkronisasi username sendiri,
  // rotasi LID, dan status kuota pesan keluar. Sebelumnya semuanya dibuang.
  client.on('mex_notification', (ev) => {
    conn.ev.emit('mex.notification', ev);

    // Cache username supaya getName()/log tidak perlu request usync lagi.
    if (ev.kind === 'username_set' && ev.lidJid && ev.username) conn.setCachedUsername(ev.lidJid, ev.username);
    else if (ev.kind === 'username_delete' && ev.lidJid) conn.setCachedUsername(ev.lidJid, null);

    // Kuota pesan keluar. Ini soal kesehatan akun, jadi selalu dicetak —
    // 'NONE' berarti normal dan tidak perlu diberitakan.
    if (ev.kind === 'message_capping' && ev.cappingStatus && ev.cappingStatus !== 'NONE') {
      const quota = ev.usedQuota != null && ev.totalQuota != null ? ` ${ev.usedQuota}/${ev.totalQuota}` : '';
      log.warn(chalk.bgRed.white(` KUOTA PESAN: ${ev.cappingStatus}${quota} `));
    }
  });

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

  // Satu-satunya jalan sesi lokal dihapus: diminta eksplisit. Dulu ini
  // dilakukan otomatis kalau registrasi tidak terkonfirmasi dalam 12 detik,
  // yang membuang sesi valid setiap kali connect pertama lambat.
  if (process.argv.includes('--reset-session')) {
    log.warn(`--reset-session: menghapus ${storeSqlitePath}`);
    for (const suffix of ['', '-shm', '-wal']) fs.rmSync(storeSqlitePath + suffix, { force: true });
  }

  // Menandai sesi yang belum pernah tersambung. Dipakai handler.js untuk
  // menahan pesan welcome/promote selama sinkronisasi awal, dan di-set false
  // begitu koneksi terbuka (lihat authenticate()).
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
  return { conn, connectionOptions };
}

async function askPhoneNumber(question) {
  let phoneNumber = (global.config.botNumber || '').replace(/\D/g, '');
  if (phoneNumber.length >= 10) {
    log.info(`Pakai nomor bot dari config.js: ${phoneNumber}`);
    return phoneNumber;
  }
  do {
    phoneNumber = (await question(chalk.blueBright('Masukkan nomor bot diawali kode negara. Contoh: 628xxx\n'))).replace(/\D/g, '');
    if (phoneNumber.length < 10) log.error('Nomor tidak valid, coba lagi.');
  } while (phoneNumber.length < 10);
  return phoneNumber;
}

// Menyiapkan login untuk sesi yang MEMANG belum terpasang.
//
// zapo-js memuat kredensial dari store sendiri di dalam connect(): kalau sesi
// sudah pernah dipasangkan, `auth_qr` dan `auth_pairing_required` tidak pernah
// muncul lagi dan bot langsung tersambung. Jadi fungsi ini tidak boleh menebak
// status registrasi lewat timer, dan tidak boleh menghapus store — cukup
// menunggu zapo-js bilang pairing dibutuhkan.
//
// config.usePair memilih metodenya: true = pairing code (prompt terminal
// dilewati kalau config.botNumber terisi), false = QR code, sama seperti --qr.
export async function authenticate(conn, { rl, question }) {
  const usePair = !!global.config.usePair && !process.argv.includes('--qr');
  global.useQR = !usePair;

  const closePrompt = () => {
    try {
      rl.close();
    } catch {}
  };

  conn._client.once('connection', (ev) => {
    if (ev.status !== 'open') return;
    global.isInit = false;
    closePrompt();
  });

  if (!usePair) {
    log.info('Mode QR aktif. QR hanya muncul kalau sesi belum tersimpan.');
    closePrompt();
    return conn;
  }

  log.info('Mode Pairing Code aktif. Kode hanya diminta kalau sesi belum tersimpan.');
  conn._client.once('auth_pairing_required', async () => {
    try {
      const phoneNumber = await askPhoneNumber(question);
      closePrompt();
      let code = await conn.requestPairingCode(phoneNumber, global.config.pairingCode);
      code = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log(chalk.black(chalk.bgGreen(' Pairing Code ')), chalk.bold(code));
    } catch (e) {
      log.error(`Gagal meminta pairing code: ${e?.message || e}`);
    }
  });

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

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((mod) => mod.default);

  const fakeConn = () => {
    const client = new EventEmitter();
    const calls = [];
    return {
      _client: client,
      requestPairingCode: async (phone, custom) => {
        calls.push({ phone, custom });
        return 'ABCD1234';
      },
      calls
    };
  };
  const rl = {
    closed: false,
    close() {
      this.closed = true;
    }
  };
  const question = async () => {
    throw new Error('prompt tidak boleh dipakai kalau botNumber terisi');
  };

  const run = async (config, drive) => {
    global.config = { usePair: false, botNumber: '', pairingCode: 'ABCD1234', ...config };
    global.isInit = true;
    const conn = fakeConn();
    rl.closed = false;
    const lines = [];
    const real = console.log;
    console.log = (...args) => lines.push(args.join(' '));
    try {
      await authenticate(conn, { rl, question });
      if (drive) await drive(conn._client);
      await new Promise((resolve) => setImmediate(resolve));
    } finally {
      console.log = real;
    }
    return { conn, lines };
  };

  // Chat pribadi: participant dihilangkan, bukan diisi undefined
  const dm = translateMessageEvent({ key: { remoteJid: '233955710214283@lid', remoteJidAlt: '628988293493@s.whatsapp.net' }, message: {}, timestampSeconds: 1786784833 });
  assert.strictEqual('participant' in dm.key, false, 'participant tidak boleh muncul sebagai undefined di DM');
  assert.strictEqual(dm.key.remoteJidPn, '628988293493@s.whatsapp.net');

  // Grup: participant diteruskan seperti biasa
  const group = translateMessageEvent({ key: { remoteJid: '123@g.us', participant: '628999@s.whatsapp.net' }, message: {} });
  assert.strictEqual(group.key.participant, '628999@s.whatsapp.net');

  // Username pengirim diteruskan kalau server melampirkannya
  const withUsername = translateMessageEvent({ key: { remoteJid: '628999@s.whatsapp.net', senderUsername: 'sariawan99' }, message: {} });
  assert.strictEqual(withUsername.key.senderUsername, 'sariawan99');
  assert.strictEqual('senderUsername' in translateMessageEvent({ key: { remoteJid: '628999@s.whatsapp.net' }, message: {} }).key, false);

  // Mode QR: tidak ada pairing code yang diminta
  const qr = await run({ usePair: false });
  assert.strictEqual(global.useQR, true, 'useQR aktif di mode QR');
  assert.deepStrictEqual(qr.conn.calls, [], 'mode QR tidak meminta pairing code');
  assert.ok(rl.closed, 'prompt ditutup di mode QR');

  // Sesi tersimpan: koneksi langsung terbuka, pairing tidak pernah diminta.
  // Ini kasus yang dulu rusak — sesi valid dibuang lalu minta scan ulang.
  const resumed = await run({ usePair: true, botNumber: '628123456789' }, (client) => client.emit('connection', { status: 'open' }));
  assert.deepStrictEqual(resumed.conn.calls, [], 'sesi tersimpan tidak minta pairing code');
  assert.strictEqual(global.isInit, false, 'isInit dilepas begitu koneksi terbuka');
  assert.ok(rl.closed, 'prompt ditutup setelah tersambung');

  // Sesi baru: zapo-js minta pairing, baru kode diambil
  const fresh = await run({ usePair: true, botNumber: '628123456789' }, (client) => client.emit('auth_pairing_required', {}));
  assert.deepStrictEqual(fresh.conn.calls, [{ phone: '628123456789', custom: 'ABCD1234' }], 'pairing code diminta sekali dengan nomor dari config');
  assert.ok(
    fresh.lines.some((line) => line.includes('ABCD-1234')),
    'kode dicetak dengan pemisah tiap 4 karakter'
  );

  console.log('connection.js self-check OK');
  process.exit(0);
}
