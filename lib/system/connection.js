// WhatsApp connection setup: auth state, socket creation, pairing/QR login
// and the connection.update reconnect logic. main.js owns everything else
// (db, plugin loading, hot reload).
import * as baileys from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import pino from 'pino';
import WebSocket from 'ws';
import fs from 'fs';
import fetch from 'node-fetch';
import chalk from 'chalk';
import QRCode from 'qrcode';
import simple from '../simple.js';

const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, fetchLatestWaWebVersion, Browsers } = baileys;

async function resolveWaVersion() {
  try {
    const { version } = await fetchLatestWaWebVersion();
    return version;
  } catch {
    try {
      const { version } = await fetchLatestBaileysVersion();
      return version;
    } catch {
      try {
        const data = await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json();
        return data.version;
      } catch {
        throw new Error('Failed to fetch WhatsApp version from all sources');
      }
    }
  }
}

function buildConnectionOptions({ creds, keys, waVersion }) {
  const msgRetryCounterCache = new NodeCache();
  const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

  return {
    printQRInTerminal: false,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {}
              },
              ...message
            }
          }
        };
      }
      return message;
    },
    auth: {
      creds,
      keys: makeCacheableSignalKeyStore(
        keys,
        pino().child({
          level: 'silent',
          stream: 'store'
        })
      )
    },
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    msgRetryCounterCache,
    browser: Browsers.macOS('Safari'),
    logger: pino({ level: 'silent' }),
    version: waVersion
  };
}

export function makeSocket(connectionOptions) {
  return simple.makeWASocket(connectionOptions);
}

export async function createClient(authFile) {
  const { state, saveCreds } = await useMultiFileAuthState(authFile);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(chalk.magenta(`-- using WA v${version.join('.')}, isLatest: ${isLatest} --`));

  const waVersion = await resolveWaVersion();
  const connectionOptions = buildConnectionOptions({ creds: state.creds, keys: state.keys, waVersion });
  const conn = makeSocket(connectionOptions);

  return { conn, connectionOptions, saveCreds };
}

// Pairing-code (or QR, with --qr) login for a fresh/unregistered session.
// Skips the terminal prompt entirely if config.botNumber is set.
export async function authenticate(conn, { rl, question }) {
  if (fs.existsSync('./sessions/creds.json') && !conn.authState.creds.registered && !conn.authState.creds.me) {
    console.log(chalk.yellow('-- WARNING: creds.json is broken, please delete it first --'));
    process.exit(0);
  }

  if (conn.authState.creds.registered || conn.authState.creds.me) return;

  if (process.argv.includes('--qr')) {
    global.useQR = true;
    console.log(chalk.blueBright('QR Mode is active. Please scan the QR code that will appear below.'));
    rl.close();
    return;
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
    const customPairingCode = 'RTXZYBOT';
    let code = await conn.requestPairingCode(phoneNumber, customPairingCode);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)));
  }, 3000);
}

export async function connectionUpdate(update) {
  const { lastDisconnect, qr } = update;
  global.timestamp.connect = new Date();

  if (qr && global.useQR) {
    console.log(await QRCode.toString(qr, { type: 'terminal', small: true }));
    console.log(chalk.yellow('\nIf the QR code above is too large or distorted, please click the link below to scan it in your browser:'));
    console.log(chalk.blueBright(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qr)}\n`));
  }

  if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && global.conn.ws.readyState !== WebSocket.CONNECTING) {
    global.reloadHandler(true).catch(console.error);
  }
  if (global.db.data == null) await global.loadDatabase();
}
