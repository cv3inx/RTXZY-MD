import * as zapo from '../simple.js'; // adapter zapo-js (connection.js dihapus)
import urlRegexSafe from 'url-regex-safe';
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import fs from 'fs';
import { pathToFileURL } from 'url';

const urlRegex = urlRegexSafe({ strict: false });
const WAMessageStubType = zapo.WAMessageStubType || {};
let terminalImage = null;

// Hanya PN jid (@s.whatsapp.net) yang boleh diformat PhoneNumber.
// @lid TIDAK PERNAH diformat — digit LID (berapapun panjangnya) bukan nomor telepon
// (mis. 224739230494840@lid akan jadi '+224 739230494840' palsu).
const pnJid = (jid) => {
  if (typeof jid !== 'string' || !jid) return null;
  if (!jid.endsWith('@s.whatsapp.net')) return null;
  const digits = jid.replace(/:\d+@/g, '@').split('@')[0];
  if (digits === '0') return null; // nomor hidden/verified (0@s.whatsapp.net) → jangan '+0'
  return digits;
};

// Nomor internasional kalau bisa (PN jid), else digit apa adanya (LID/lainnya).
const displayNumber = (jid) => {
  if (!jid) return null;
  const digits = pnJid(jid);
  if (!digits) return String(jid).split('@')[0];
  return PhoneNumber('+' + digits).getNumber('international') || digits;
};

const resolveJid = (conn, jid, groupHint = '') => (conn.getJidAsync ? conn.getJidAsync(jid, groupHint) : Promise.resolve(jid));

// Pesan protokol (receipt, revoke, sinkronisasi app-state) bukan pesan dari
// manusia — tanpa filter ini log penuh entry 'Protocol' yang tidak ada isinya.
const SKIP_MTYPES = new Set(['protocolMessage', 'senderKeyDistributionMessage', 'messageContextInfo']);

// Tipe yang namanya tidak perlu ditulis: pesan teks biasa sudah jelas dari isinya.
const PLAIN_TYPES = new Set(['Conversation', 'ExtendedText']);

// Sejajar di bawah jam pada baris header (8 karakter jam + 2 spasi).
const PAD = ' '.repeat(10);

function mediaSize(m) {
  const msg = m.msg;
  if (msg?.vcard) return msg.vcard.length;
  const len = msg?.fileLength;
  if (typeof len === 'object' && len !== null) return len.low || 0;
  return len || 0;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const exp = Math.floor(Math.log(bytes) / Math.log(1000));
  const size = (bytes / 1000 ** exp).toFixed(1);
  const unit = ['', ...'KMGTP'][exp] || '';
  return `${size} ${unit}B`;
}

function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  return `${Math.floor(s / 60)}`.padStart(2, '0') + ':' + `${s % 60}`.padStart(2, '0');
}

function formatMtype(m) {
  if (!m.mtype) return '';
  return m.mtype
    .replace(/message$/i, '')
    .replace('audio', m.msg?.ptt ? 'PTT' : 'audio')
    .replace(/^./, (v) => v.toUpperCase());
}

const indent = (text) =>
  String(text)
    .split('\n')
    .map((line) => PAD + line)
    .join('\n');

export default async function printMessage(m, conn = { user: {} }) {
  if (!m) return;
  if (SKIP_MTYPES.has(m.mtype) && !m.messageStubType) return;

  const senderJid = await resolveJid(conn, m.sender, m.isGroup ? m.chat : '');
  const senderName = senderJid ? await conn.getName(senderJid) : '';
  const senderNumber = senderJid ? displayNumber(senderJid) : '';

  const chat = m.isGroup ? (await conn.getName(conn.getJid ? conn.getJid(m.chat) : m.chat).catch(() => '')) || 'Grup' : 'DM';

  let img;
  try {
    if (global.opts?.['img'] && /image/gi.test(m.mtype)) {
      if (!terminalImage) {
        terminalImage = await import('terminal-image');
        terminalImage = terminalImage.default || terminalImage;
      }
      img = await terminalImage.buffer(await m.download());
    }
  } catch (e) {
    console.error(e);
  }

  const time = new Date(1000 * (m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000)).toTimeString().slice(0, 8);
  const who = m.fromMe ? 'Bot' : senderName || senderNumber || 'System';

  // Username hanya dibaca dari cache: print jalan di jalur setiap pesan, jadi
  // tidak boleh memicu request usync sendiri.
  const username = m.fromMe ? null : m.senderUsername || (conn.getUsername ? await conn.getUsername(senderJid, true) : null);
  const handle = username && !who.includes('@' + username) ? chalk.dim(` @${username}`) : '';

  // Nomor cuma ditulis kalau menambah info — kalau nama tidak ketemu, `who`
  // sudah berisi nomornya.
  const whoNumber = !m.fromMe && senderName && senderNumber ? chalk.dim(` · ${senderNumber}`) : '';

  console.log(`${chalk.dim(time)}  ${chalk.bold.green(who)}${handle}${whoNumber}  ${chalk.dim('›')}  ${chalk.cyan(chat)}`);

  // Baris meta hanya memuat yang benar-benar ada isinya.
  const meta = [];
  const stubType = m.messageStubType ? WAMessageStubType[m.messageStubType] : '';
  if (stubType) meta.push(chalk.magenta(stubType));
  const mtype = formatMtype(m);
  if (mtype && !PLAIN_TYPES.has(mtype)) meta.push(chalk.yellow(mtype));
  if (m.msg?.seconds) meta.push(chalk.magenta(formatDuration(m.msg.seconds)));
  const size = formatFileSize(mediaSize(m));
  if (size) meta.push(chalk.magenta(size));
  const user = global.DATABASE?.data?.users?.[m.sender];
  if (m.isCommand && user) meta.push(chalk.dim(`xp +${m.exp ?? 0} (${user.exp}) · limit ${user.limit}`));
  if (meta.length) console.log(PAD + meta.join(chalk.dim(' · ')));

  if (img) console.log(img.trimEnd());

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '');
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;
    let mdFormat =
      (depth = 4) =>
      (_, type, text, monospace) => {
        let types = { _: 'italic', '*': 'bold', '~': 'strikethrough' };
        text = text || monospace;
        return !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)));
      };
    if (log.length < 4096)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i;
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url;
      });
    log = log.replace(mdRegex, mdFormat(4));
    if (m.mentionedJid)
      for (let user of m.mentionedJid) {
        let userJid = await resolveJid(conn, user, m.isGroup ? m.chat : '');
        log = log.replace('@' + userJid.split`@`[0], chalk.blueBright('@' + (await conn.getName(userJid))));
      }
    console.log(indent(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log));
  }

  if (m.messageStubParameters) {
    let paramsLog = await Promise.all(
      m.messageStubParameters.map(async (param) => {
        if (typeof param === 'string' && param.startsWith('{')) {
          try {
            param = JSON.parse(param);
          } catch {}
        }
        if (param && typeof param === 'object') {
          param = param.phoneNumber || param.id || param.jid || param;
        }
        if (typeof param !== 'string' || !param) return '';
        // Tidak semua stub parameter berisi JID — ganti subjek/deskripsi/link
        // mengirim teks biasa, jadi jangan dicoba diresolusi jadi nama kontak.
        if (!param.includes('@')) return chalk.gray(param);
        const jid = await resolveJid(conn, conn.decodeJid(param), m.isGroup ? m.chat : '');
        const name = await conn.getName(jid).catch(() => '');
        return chalk.gray(displayNumber(jid) + (name ? ' ~' + name : ''));
      })
    );
    const out = paramsLog.filter(Boolean).join(', ');
    if (out) console.log(indent(out));
  }

  if (/document/i.test(m.mtype)) console.log(indent(chalk.dim(`📄 ${m.msg.filename || m.msg.displayName || 'Document'}`)));
  else if (/contactsArray/i.test(m.mtype)) console.log(indent(chalk.dim(`👥 ${m.msg.contacts?.length || 0} kontak`)));
  else if (/contact/i.test(m.mtype)) console.log(indent(chalk.dim(`👤 ${m.msg.displayName || 'Kontak'}`)));
}

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((mod) => mod.default);

  const conn = {
    user: { jid: '628111@s.whatsapp.net', name: 'Bot' },
    getName: async (jid) => (jid.startsWith('62858') ? 'Sariawan' : 'Grup Kocak'),
    getJid: (jid) => jid,
    decodeJid: (jid) => jid
  };
  const base = { sender: '6285891001164@s.whatsapp.net', chat: '6285891001164@s.whatsapp.net', messageTimestamp: { low: 1755245247 } };

  const capture = async (m) => {
    const lines = [];
    const real = console.log;
    console.log = (...args) => lines.push(args.join(' '));
    try {
      await printMessage({ ...base, ...m }, conn);
    } finally {
      console.log = real;
    }
    return lines;
  };

  // Pesan protokol tidak boleh dicetak sama sekali — ini sumber spam 'Protocol'
  assert.deepStrictEqual(await capture({ mtype: 'protocolMessage', msg: {} }), [], 'protocolMessage harus dilewati');
  assert.deepStrictEqual(await capture({ mtype: 'senderKeyDistributionMessage', msg: {} }), [], 'senderKeyDistribution harus dilewati');
  // ...kecuali kalau pesan itu membawa stub grup (ganti subjek, dll)
  assert.ok((await capture({ mtype: 'protocolMessage', msg: {}, messageStubType: 21 })).length > 0, 'stub grup tetap dicetak');

  // Teks biasa: header + isi, tanpa baris meta dan tanpa label tipe
  const plain = await capture({ mtype: 'conversation', msg: { text: 'halo bot' }, text: 'halo bot' });
  assert.strictEqual(plain.length, 2, 'teks biasa = 2 baris');
  assert.ok(plain[0].includes('Sariawan') && plain[0].includes('+62 858-9100-1164') && plain[0].includes('DM'), plain[0]);
  assert.ok(!plain[0].includes('Conversation') && !plain.join('\n').includes('0 B'), 'tanpa label tipe & tanpa ukuran kosong');
  assert.ok(plain[1].startsWith(PAD) && plain[1].includes('halo bot'), plain[1]);

  // Media + command: baris meta memuat tipe, ukuran, xp, dan limit
  global.DATABASE = { data: { users: { [base.sender]: { exp: 26, limit: 100 } } } };
  const media = await capture({
    mtype: 'imageMessage',
    msg: { fileLength: { low: 45000 }, caption: 'nih' },
    text: 'nih',
    chat: '123@g.us',
    isGroup: true,
    isCommand: true,
    exp: 3
  });
  assert.ok(media[0].includes('Grup Kocak'), media[0]);
  assert.ok(media[1].includes('Image') && media[1].includes('45.0 KB') && media[1].includes('xp +3 (26)') && media[1].includes('limit 100'), media[1]);

  // Pesan dari bot sendiri dilabeli, tidak mengulang nomor bot
  const own = await capture({ mtype: 'conversation', msg: { text: 'ok' }, text: 'ok', fromMe: true });
  assert.ok(own[0].includes('Bot') && !own[0].includes('+62 858'), own[0]);

  // Username pengirim ikut di header, dibaca dari key pesan tanpa request usync
  const handle = await capture({ mtype: 'conversation', msg: { text: 'hai' }, text: 'hai', senderUsername: 'sariawan99' });
  assert.ok(handle[0].includes('@sariawan99'), handle[0]);
  const noHandle = await capture({ mtype: 'conversation', msg: { text: 'hai' }, text: 'hai' });
  assert.ok(!noHandle[0].includes('@'), noHandle[0]);

  // Durasi audio ikut di baris meta, bukan baris sendiri
  const ptt = await capture({ mtype: 'audioMessage', msg: { fileLength: { low: 120500 }, ptt: true, seconds: 8 } });
  assert.strictEqual(ptt.length, 2, 'audio = header + meta saja');
  assert.ok(ptt[1].includes('PTT') && ptt[1].includes('00:08') && ptt[1].includes('120.5 KB'), ptt[1]);

  // Stub parameter berupa teks (ganti subjek) tidak boleh diresolusi jadi nama kontak
  const stub = await capture({ mtype: 'conversation', msg: { text: '' }, text: '', chat: '123@g.us', isGroup: true, messageStubType: 21, messageStubParameters: ['Grup Baru'] });
  assert.ok(
    stub.some((line) => line.includes('Grup Baru') && !line.includes('~')),
    stub.join(' | ')
  );

  console.log('print.js self-check OK');
  process.exit(0);
}

const file = import.meta.filename;
// unwatch dulu: reload meng-import ulang module ini -> top-level jalan lagi,
// tanpa ini listener StatWatcher menumpuk (leak)
fs.unwatchFile(file);
fs.watchFile(file, async () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'lib/system/print.js'"));
  await import(pathToFileURL(file).href + '?update=' + Date.now());
});
