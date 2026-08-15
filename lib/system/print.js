// Log pesan masuk/keluar ke terminal.
//
// Bentuknya:
//
//   16:26:49  Ditzzy @ditzzy · +62 898-8293-493  ›  DM
//             hello
//   16:30:04  hello lagi
//
//   16:32:00  Budi  ›  Grup Kocak
//             Image · 45.0 KB
//             nih gambarnya
//
// Tiga aturan yang membentuknya:
//
//   1. Kolom jam sama dengan lib/system/log.js, jadi log pesan dan log sistem
//      sejajar dan tetap bisa dibedakan.
//   2. Baris pertama tiap pesan memegang jamnya, sisanya menjorok. Header
//      (nama, nomor, chat) hanya diulang kalau pengirim atau chat berganti,
//      supaya percakapan berurutan tidak jadi nama yang sama berkali-kali.
//   3. Yang kosong tidak dicetak. Tanpa aturan ini log penuh field hampa.
import * as zapo from '../simple.js';
import { displayJidNumber } from '../simple.js';
import urlRegexSafe from 'url-regex-safe';
import chalk from 'chalk';
import fs from 'fs';
import { pathToFileURL } from 'url';
import log from './log.js';

const urlRegex = urlRegexSafe({ strict: false });
const WAMessageStubType = zapo.WAMessageStubType || {};
let terminalImage = null;

const TIME_WIDTH = 8;
const PAD = ' '.repeat(TIME_WIDTH + 2);

// Pesan protokol (receipt, revoke, sinkronisasi app-state) bukan pesan dari
// manusia dan isinya selalu kosong — tanpa filter ini log penuh entry
// 'Protocol' yang tidak berarti apa-apa.
const SKIP_MTYPES = new Set(['protocolMessage', 'senderKeyDistributionMessage', 'messageContextInfo']);

// Tipe yang namanya tidak perlu ditulis: pesan teks sudah jelas dari isinya.
const PLAIN_TYPES = new Set(['Conversation', 'ExtendedText']);

// Isi pesan dipangkas supaya satu forward panjang tidak menelan seluruh layar.
const MAX_BODY_LINES = 4;

// Header diulang lagi kalau blok sebelumnya sudah selama ini.
const SAME_BLOCK_MS = 5 * 60 * 1000;

let lastBlock = null;
let lastBlockAt = 0;

/** Paksa header dicetak lagi pada pesan berikutnya. */
export function resetGrouping() {
  lastBlock = null;
  lastBlockAt = 0;
}

// --- pemformat kecil --------------------------------------------------------

const resolveJid = (conn, jid, groupHint = '') => (conn.getJidAsync ? conn.getJidAsync(jid, groupHint) : Promise.resolve(jid));

const prefixLines = (text, pad) =>
  String(text)
    .split('\n')
    .map((line) => pad + line)
    .join('\n');

const firstLine = (text) => String(text).split('\n')[0];
const restLines = (text) => String(text).split('\n').slice(1).join('\n');

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

function formatTime(m) {
  const seconds = m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000;
  return new Date(1000 * seconds).toTimeString().slice(0, TIME_WIDTH);
}

// Lebar isi mengikuti terminal, dengan batas bawah supaya tetap terbaca di
// terminal sempit atau saat output dialihkan ke file (columns undefined).
const bodyWidth = () => Math.max(40, (process.stdout.columns || 100) - PAD.length);

/**
 * Pangkas isi pesan SEBELUM diwarnai. Memotong string yang sudah mengandung
 * kode ANSI bisa memutus escape sequence di tengah dan merusak warna sisanya.
 */
function clampBody(text) {
  const width = bodyWidth();
  const lines = String(text).split('\n');
  const kept = lines.slice(0, MAX_BODY_LINES).map((line) => (line.length > width ? line.slice(0, width - 1) + '…' : line));
  return { text: kept.join('\n'), dropped: Math.max(0, lines.length - MAX_BODY_LINES) };
}

// --- dekorasi isi pesan -----------------------------------------------------

const MD_REGEX = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;
const MD_STYLE = { _: 'italic', '*': 'bold', '~': 'strikethrough' };

function renderMarkdown(text, depth = 4) {
  return text.replace(MD_REGEX, (_, marker, inner, monospace) => {
    const content = inner || monospace;
    const style = MD_STYLE[marker];
    return !style || depth < 1 ? content : chalk[style](renderMarkdown(content, depth - 1));
  });
}

function highlightUrls(text) {
  // URL yang menempel ke teks lain dibiarkan: mewarnai setengah kata lebih
  // membingungkan daripada membantu.
  return text.replace(urlRegex, (url, index, whole) => {
    const end = index + url.length;
    const standalone = index === 0 || end === whole.length || (/^\s$/.test(whole[end]) && /^\s$/.test(whole[index - 1]));
    return standalone ? chalk.blueBright(url) : url;
  });
}

async function resolveMentions(text, m, conn) {
  if (!m.mentionedJid?.length) return text;
  let out = text;
  for (const mentioned of m.mentionedJid) {
    const jid = await resolveJid(conn, mentioned, m.isGroup ? m.chat : '');
    const name = await conn.getName(jid).catch(() => '');
    if (name) out = out.replace('@' + String(jid).split('@')[0], chalk.blueBright('@' + name));
  }
  return out;
}

// --- penyusun baris ---------------------------------------------------------

async function buildHeader(m, conn, { senderJid, senderName, senderNumber, chat }) {
  const who = m.fromMe ? 'Bot' : senderName || senderNumber || 'System';

  // Username dibaca dari cache saja: fungsi ini jalan di jalur setiap pesan,
  // jadi tidak boleh memicu request usync sendiri.
  const username = m.fromMe ? null : m.senderUsername || (conn.getUsername ? await conn.getUsername(senderJid, true) : null);
  const handle = username && !who.includes('@' + username) ? chalk.dim(` @${username}`) : '';

  // Nomor hanya menambah info kalau namanya ketemu — kalau tidak, `who` sudah
  // berisi nomornya.
  const number = !m.fromMe && senderName && senderNumber ? chalk.dim(` · ${senderNumber}`) : '';

  return `${chalk.bold.green(who)}${handle}${number}  ${chalk.dim('›')}  ${chalk.cyan(chat)}`;
}

function buildMeta(m) {
  const parts = [];

  const stubType = m.messageStubType ? WAMessageStubType[m.messageStubType] : '';
  if (stubType) parts.push(chalk.magenta(stubType));

  const mtype = formatMtype(m);
  if (mtype && !PLAIN_TYPES.has(mtype)) parts.push(chalk.yellow(mtype));

  if (m.msg?.seconds) parts.push(chalk.magenta(formatDuration(m.msg.seconds)));

  const size = formatFileSize(mediaSize(m));
  if (size) parts.push(chalk.magenta(size));

  const user = global.DATABASE?.data?.users?.[m.sender];
  if (m.isCommand && user) parts.push(chalk.dim(`xp +${m.exp ?? 0} (${user.exp}) · limit ${user.limit}`));

  return parts.length ? parts.join(chalk.dim(' · ')) : '';
}

async function buildBody(m, conn) {
  if (typeof m.text !== 'string' || !m.text) return '';

  const clamped = clampBody(m.text.replace(/\u200e+/g, ''));
  let body = clamped.text;
  if (body.length < 4096) body = highlightUrls(body);
  body = renderMarkdown(body);
  body = await resolveMentions(body, m, conn);

  body = m.error != null ? chalk.red(body) : m.isCommand ? chalk.yellow(body) : body;
  if (clamped.dropped > 0) body += chalk.dim(`\n… +${clamped.dropped} baris lagi`);
  return body;
}

/**
 * Stub parameter tidak selalu berisi JID: ganti subjek, deskripsi, dan link
 * grup mengirim teks biasa, jadi jangan dicoba diresolusi jadi nama kontak.
 */
async function buildStubParams(m, conn) {
  if (!m.messageStubParameters?.length) return '';

  const resolved = await Promise.all(
    m.messageStubParameters.map(async (param) => {
      if (typeof param === 'string' && param.startsWith('{')) {
        try {
          param = JSON.parse(param);
        } catch {}
      }
      if (param && typeof param === 'object') param = param.phoneNumber || param.id || param.jid || param;
      if (typeof param !== 'string' || !param) return '';
      if (!param.includes('@')) return param;

      const jid = await resolveJid(conn, conn.decodeJid(param), m.isGroup ? m.chat : '');
      const name = await conn.getName(jid).catch(() => '');
      return displayJidNumber(jid) + (name ? ` ~${name}` : '');
    })
  );

  const out = resolved.filter(Boolean).join(', ');
  return out ? chalk.gray(out) : '';
}

function buildAttachment(m) {
  if (/document/i.test(m.mtype)) return chalk.dim(`📄 ${m.msg?.filename || m.msg?.displayName || 'Document'}`);
  if (/contactsArray/i.test(m.mtype)) return chalk.dim(`👥 ${m.msg?.contacts?.length || 0} kontak`);
  if (/contact/i.test(m.mtype)) return chalk.dim(`👤 ${m.msg?.displayName || 'Kontak'}`);
  return '';
}

async function renderTerminalImage(m) {
  if (!global.opts?.['img'] || !/image/gi.test(m.mtype)) return '';
  try {
    if (!terminalImage) {
      const mod = await import('terminal-image');
      terminalImage = mod.default || mod;
    }
    return (await terminalImage.buffer(await m.download())).trimEnd();
  } catch {
    // Gagal render gambar bukan alasan untuk kehilangan log pesannya.
    return '';
  }
}

// --- entri utama ------------------------------------------------------------

export default async function printMessage(m, conn = { user: {} }) {
  if (!m) return;
  if (SKIP_MTYPES.has(m.mtype) && !m.messageStubType) return;

  const senderJid = await resolveJid(conn, m.sender, m.isGroup ? m.chat : '');
  const senderName = senderJid ? await conn.getName(senderJid) : '';
  const senderNumber = senderJid ? displayJidNumber(senderJid) : '';
  const chat = m.isGroup ? (await conn.getName(conn.getJid ? conn.getJid(m.chat) : m.chat).catch(() => '')) || 'Grup' : 'DM';

  const block = `${m.sender}|${m.chat}`;
  const now = Date.now();
  const newBlock = block !== lastBlock || now - lastBlockAt > SAME_BLOCK_MS;
  lastBlock = block;
  lastBlockAt = now;

  const time = formatTime(m);

  // Semua bagian disusun dulu, baru dicetak — hanya dengan begitu bisa
  // diketahui bagian mana yang jadi baris pertama dan memegang kolom jam.
  const rows = [buildMeta(m), await renderTerminalImage(m), await buildBody(m, conn), await buildStubParams(m, conn), buildAttachment(m)].filter(Boolean);

  if (newBlock) {
    console.log();
    console.log(`${chalk.dim(time)}  ${await buildHeader(m, conn, { senderJid, senderName, senderNumber, chat })}`);
    for (const row of rows) console.log(prefixLines(row, PAD));
    return;
  }

  // Pesan lanjutan dalam blok yang sama: tanpa header, tapi baris pertamanya
  // memegang jam supaya tetap terlihat kapan masuknya.
  if (!rows.length) return;
  console.log(`${chalk.dim(time)}  ${firstLine(rows[0])}`);
  const rest = restLines(rows[0]);
  if (rest) console.log(prefixLines(rest, PAD));
  for (const row of rows.slice(1)) console.log(prefixLines(row, PAD));
}

const file = import.meta.filename;
// unwatch dulu: reload meng-import ulang module ini -> top-level jalan lagi,
// tanpa ini listener StatWatcher menumpuk (leak)
fs.unwatchFile(file);
fs.watchFile(file, async () => {
  fs.unwatchFile(file);
  log.reload('lib/system/print.js');
  await import(pathToFileURL(file).href + '?update=' + Date.now());
});

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((mod) => mod.default);

  const conn = {
    user: { jid: '628111000222@s.whatsapp.net', name: 'Bot' },
    getName: async (jid) => (jid.startsWith('62858') ? 'Sariawan' : 'Grup Kocak'),
    getJid: (jid) => jid,
    decodeJid: (jid) => jid
  };
  const base = { sender: '6285891001164@s.whatsapp.net', chat: '6285891001164@s.whatsapp.net', messageTimestamp: { low: 1755245247 } };

  const capture = async (m, { keepGrouping = false } = {}) => {
    if (!keepGrouping) resetGrouping();
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
  const text = (extra = {}) => ({ mtype: 'conversation', msg: { text: 'halo bot' }, text: 'halo bot', ...extra });

  // Pesan protokol tidak boleh dicetak sama sekali — ini sumber spam 'Protocol'
  assert.deepStrictEqual(await capture({ mtype: 'protocolMessage', msg: {} }), [], 'protocolMessage harus dilewati');
  assert.deepStrictEqual(await capture({ mtype: 'senderKeyDistributionMessage', msg: {} }), [], 'senderKeyDistribution harus dilewati');
  // ...kecuali kalau membawa stub grup (ganti subjek, dll)
  assert.ok((await capture({ mtype: 'protocolMessage', msg: {}, messageStubType: 21 })).length > 0, 'stub grup tetap dicetak');

  // Blok baru: baris kosong, header berjam, isi menjorok
  const first = await capture(text());
  assert.strictEqual(first.length, 3, `blok baru = kosong + header + isi, dapat ${first.length}`);
  assert.strictEqual(first[0], '', 'blok diawali baris kosong');
  assert.match(first[1], /^\d\d:\d\d:\d\d {2}/, first[1]);
  assert.ok(first[1].includes('Sariawan') && first[1].includes('+62 858-9100-1164') && first[1].includes('DM'), first[1]);
  assert.ok(!first[1].includes('Conversation'), 'tipe teks biasa tidak perlu ditulis');
  assert.ok(first[2].startsWith(PAD) && first[2].includes('halo bot'), first[2]);

  // Pesan berikutnya dari pengirim & chat yang sama: header tidak diulang
  const second = await capture(text({ text: 'halo lagi', msg: { text: 'halo lagi' } }), { keepGrouping: true });
  assert.strictEqual(second.length, 1, `lanjutan = satu baris, dapat ${second.length}: ${JSON.stringify(second)}`);
  assert.match(second[0], /^\d\d:\d\d:\d\d {2}halo lagi/, second[0]);

  // Ganti chat = blok baru walaupun pengirimnya sama
  const other = await capture(text({ chat: '123@g.us', isGroup: true }), { keepGrouping: true });
  assert.strictEqual(other[0], '', 'ganti chat harus memulai blok baru');
  assert.ok(other[1].includes('Grup Kocak'), other[1]);

  // Baris meta hanya muncul kalau ada isinya
  global.DATABASE = { data: { users: { [base.sender]: { exp: 26, limit: 100 } } } };
  const media = await capture({ mtype: 'imageMessage', msg: { fileLength: { low: 45000 }, caption: 'nih' }, text: 'nih', isCommand: true, exp: 3 });
  assert.ok(media[2].includes('Image') && media[2].includes('45.0 KB') && media[2].includes('xp +3 (26)') && media[2].includes('limit 100'), media[2]);
  assert.ok(media[3].includes('nih'), media[3]);

  // Audio: durasi ikut di baris meta, bukan baris sendiri
  const ptt = await capture({ mtype: 'audioMessage', msg: { fileLength: { low: 120500 }, ptt: true, seconds: 8 } });
  assert.strictEqual(ptt.length, 3, `audio = kosong + header + meta, dapat ${ptt.length}`);
  assert.ok(ptt[2].includes('PTT') && ptt[2].includes('00:08') && ptt[2].includes('120.5 KB'), ptt[2]);

  // Pesan dari bot sendiri dilabeli, tidak mengulang nomor bot
  const own = await capture(text({ fromMe: true }));
  assert.ok(own[1].includes('Bot') && !own[1].includes('+62 858'), own[1]);

  // Username pengirim ikut di header, dibaca tanpa request jaringan
  const handle = await capture(text({ senderUsername: 'sariawan99' }));
  assert.ok(handle[1].includes('@sariawan99'), handle[1]);
  assert.ok(!(await capture(text()))[1].includes('@'), 'tanpa username tidak ada @');

  // Stub parameter berupa teks tidak boleh diresolusi jadi nama kontak
  const stub = await capture({ mtype: 'conversation', msg: { text: '' }, text: '', chat: '123@g.us', isGroup: true, messageStubType: 21, messageStubParameters: ['Grup Baru'] });
  assert.ok(
    stub.some((line) => line.includes('Grup Baru') && !line.includes('~')),
    stub.join(' | ')
  );

  // Isi yang panjang dipangkas per baris dan per jumlah baris
  const wide = 'x'.repeat(5000);
  const long = await capture(text({ text: wide, msg: { text: wide } }));
  assert.ok(long[2].length < 5000, `baris panjang harus dipangkas, dapat ${long[2].length}`);
  assert.ok(long[2].includes('…'), 'pangkasan ditandai elipsis');

  const many = Array.from({ length: 12 }, (_, i) => `baris ${i}`).join('\n');
  const clipped = await capture(text({ text: many, msg: { text: many } }));
  assert.ok(
    clipped.some((line) => line.includes('+8 baris lagi')),
    clipped.join(' | ')
  );
  assert.ok(!clipped.some((line) => line.includes('baris 11')), 'baris di luar batas tidak dicetak');

  // Pangkasan terjadi sebelum pewarnaan, jadi tidak ada escape ANSI terpotong
  const url = `https://contoh.dev/${'a'.repeat(400)}`;
  const colored = await capture(text({ text: url, msg: { text: url } }));
  const escapes = (colored.join('\n').match(/\u001b\[/g) || []).length;
  assert.strictEqual(escapes % 2, 0, 'jumlah escape ANSI harus genap (tidak ada yang terpotong)');

  console.log('print.js self-check OK');
  process.exit(0);
}
