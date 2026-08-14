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

function messageSize(m) {
  const msg = m.msg;
  if (msg?.vcard) return msg.vcard.length;
  if (msg?.fileLength) return msg.fileLength.low || msg.fileLength;
  if (msg?.axolotlSenderKeyDistributionMessage) return msg.axolotlSenderKeyDistributionMessage.length;
  return m.text ? m.text.length : 0;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const exp = Math.floor(Math.log(bytes) / Math.log(1000));
  const size = (bytes / 1009 ** exp).toFixed(1);
  const unit = ['', ...'KMGTP'][exp] || '';
  return `${size} ${unit}B`;
}

function formatMtype(m) {
  if (!m.mtype) return '';
  return m.mtype
    .replace(/message$/i, '')
    .replace('audio', m.msg?.ptt ? 'PTT' : 'audio')
    .replace(/^./, (v) => v.toUpperCase());
}

export default async function (m, conn = { user: {} }) {
  const senderJid = await resolveJid(conn, m.sender, m.isGroup ? m.chat : '');
  const senderName = senderJid ? await conn.getName(senderJid) : '';
  const sender = senderJid ? displayNumber(senderJid) + (senderName ? ' ~' + senderName : '') : 'System';

  const chat = m.chat ? await conn.getName(conn.getJid ? conn.getJid(m.chat) : m.chat).catch(() => '') : '';

  const meJid = conn.user?.jid ? await (conn.getJidAsync ? conn.getJidAsync(conn.user.jid) : Promise.resolve(conn.getJid ? conn.getJid(conn.user.jid) : conn.user.jid)) : '';
  const me = meJid ? displayNumber(meJid) : 'Unknown';

  let img;
  try {
    if (global.opts['img'] && /image/gi.test(m.mtype)) {
      if (!terminalImage) {
        terminalImage = await import('terminal-image');
        terminalImage = terminalImage.default || terminalImage;
      }
      img = await terminalImage.buffer(await m.download());
    }
  } catch (e) {
    console.error(e);
  }

  const filesize = messageSize(m);
  const user = global.DATABASE?.data?.users[m.sender];
  const messageTime = new Date(1000 * (m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000)).toTimeString();
  const stubType = m.messageStubType ? WAMessageStubType[m.messageStubType] : '';
  const limitInfo = user ? `|${user.exp}|${user.limit}` : '';

  console.log(
    `▣────────────···
│ ${chalk.redBright(me + ' ~' + (conn.user?.name || ''))}
│⏰ㅤ${chalk.black(chalk.bgYellow(messageTime))}
│📑ㅤ${chalk.black(chalk.bgGreen(stubType))}
│📊ㅤ${chalk.magenta(`${filesize} [${formatFileSize(filesize)}]`)}
│📤ㅤ${chalk.green(sender)}
│📃ㅤ${chalk.yellow(`${m.exp ?? '?'}${limitInfo}`)}
│📥ㅤ${chalk.green(m.chat + (chat ? ' ~' + chat : ''))}
│💬ㅤ${chalk.black(chalk.bgYellow(formatMtype(m)))}
▣────────────···`.trim()
  );

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
    console.log(m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow(log) : log);
  }

  if (m.messageStubParameters) {
    let paramsLog = await Promise.all(
      m.messageStubParameters.map(async (jid) => {
        if (typeof jid === 'string' && jid.startsWith('{')) {
          try {
            jid = JSON.parse(jid);
          } catch {}
        }
        if (typeof jid === 'object') {
          jid = jid.phoneNumber || jid.id || jid.jid || jid;
        }
        if (typeof jid !== 'string') return '';
        jid = conn.decodeJid(jid);
        jid = await resolveJid(conn, jid, m.isGroup ? m.chat : '');
        let name = await conn.getName(jid).catch(() => '');
        return chalk.gray(displayNumber(jid) + (name ? ' ~' + name : ''));
      })
    );
    let out = paramsLog.filter(Boolean).join(', ');
    if (out) console.log(out);
  }

  if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.filename || m.msg.displayName || 'Document'}`);
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦 ${' ' || ''}`);
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`);
  else if (/audio/i.test(m.mtype)) {
    let s = m.msg.seconds || 0;
    console.log(
      `${m.msg.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${Math.floor(s / 60)
        .toString()
        .padStart(2, 0)}:${(s % 60).toString().padStart(2, 0)}`
    );
  }

  console.log();
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
