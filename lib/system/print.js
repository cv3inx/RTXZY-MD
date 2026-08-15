// Log pesan masuk/keluar ke terminal.
//
//   ┌────────────────────────────────────────────────────────
//   │ 🤖 BOT   +62 858-9100-1164 ~Sariawan
//   │ ⏰ TIME  15/08/2026 16:26:49
//   │ 👤 FROM  +62 898-8293-493 ~Ditzzy @ditzzy
//   │ 💬 CHAT  628988293493@s.whatsapp.net ~Ditzzy
//   │ 📦 TYPE  Conversation  •  exp:24  •  limit:100
//   └────────────────────────────────────────────────────────
//   ┊ hello
//
// Label dibuat lebar tetap supaya kolom nilainya lurus, dan isi pesan diberi
// garis pemandu `┊` supaya jelas mana kotak dan mana isi.
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

const BAR_WIDTH = 56;
const LABEL_WIDTH = 5;
const GUIDE = chalk.cyan('┊ ');

// Pesan protokol (receipt, revoke, sinkronisasi app-state) bukan pesan dari
// manusia dan isinya selalu kosong — tanpa filter ini log penuh kotak 'Protocol'
// yang tidak berarti apa-apa.
const SKIP_MTYPES = new Set(['protocolMessage', 'senderKeyDistributionMessage', 'messageContextInfo']);

// Isi pesan dipangkas supaya satu forward panjang tidak menelan seluruh layar.
const MAX_BODY_LINES = 6;

// --- pemformat kecil --------------------------------------------------------

const resolveJid = (conn, jid, groupHint = '') => (conn.getJidAsync ? conn.getJidAsync(jid, groupHint) : Promise.resolve(jid));

/** `nomor ~Nama` untuk ditampilkan; nama dilewati kalau tidak ketemu. */
const withName = (jid, name) => displayJidNumber(jid) + (name ? chalk.dim(' ~' + name) : '');

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
  if (!m.mtype) return '-';
  return m.mtype
    .replace(/message$/i, '')
    .replace('audio', m.msg?.ptt ? 'PTT' : 'audio')
    .replace(/^./, (v) => v.toUpperCase());
}

/**
 * Tanggal + jam. Sengaja tidak memakai toLocaleString('id-ID') apa adanya:
 * locale itu memakai titik sebagai pemisah jam (16.26.49) yang mudah tertukar
 * dengan tanggal.
 */
function formatTime(m) {
  const seconds = m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000;
  const d = new Date(1000 * seconds);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${d.toTimeString().slice(0, 8)}`;
}

// Lebar isi mengikuti terminal, dengan batas bawah supaya tetap terbaca di
// terminal sempit atau saat output dialihkan ke file (columns undefined).
const bodyWidth = () => Math.max(40, (process.stdout.columns || 100) - 2);

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

// --- kotak header -----------------------------------------------------------

const bar = () => chalk.cyan('─'.repeat(BAR_WIDTH));
const row = (emoji, name, value) => `${chalk.cyan('│ ')}${emoji} ${chalk.dim(name.padEnd(LABEL_WIDTH))}${value}`;

async function buildBox(m, conn, { senderJid, senderName, chat }) {
  const meJid = conn.user?.jid || '';
  const rows = [row('🤖', 'BOT', chalk.greenBright(meJid ? displayJidNumber(meJid) : '-') + (conn.user?.name ? chalk.dim(' ~' + conn.user.name) : '')), row('⏰', 'TIME', chalk.yellow(formatTime(m)))];

  // Username dibaca dari cache saja: fungsi ini jalan di jalur setiap pesan,
  // jadi tidak boleh memicu request usync sendiri.
  const username = m.fromMe ? null : m.senderUsername || (conn.getUsername ? await conn.getUsername(senderJid, true) : null);
  rows.push(row('👤', 'FROM', chalk.whiteBright(withName(senderJid, senderName)) + (username ? chalk.dim(' @' + username) : '') + (m.fromMe ? chalk.magenta('  [bot]') : '')));

  rows.push(row('💬', 'CHAT', chalk.whiteBright(m.chat) + (chat ? chalk.dim(' ~' + chat) : '') + (m.isGroup ? chalk.magenta('  [group]') : '')));

  // Bagian TYPE: hanya yang punya isi. Ukuran cuma bermakna untuk media, jadi
  // pesan teks tidak dibubuhi "0B" palsu.
  const detail = [];
  const size = formatFileSize(mediaSize(m));
  if (size) detail.push(size);
  if (m.msg?.seconds) detail.push(formatDuration(m.msg.seconds));
  if (m.exp != null) detail.push(`exp:${m.exp}`);
  const user = global.DATABASE?.data?.users?.[m.sender];
  if (user) detail.push(`limit:${user.limit}`);
  rows.push(row('📦', 'TYPE', chalk.blueBright(formatMtype(m)) + (detail.length ? chalk.dim(`  •  ${detail.join('  •  ')}`) : '')));

  const stub = m.messageStubType ? WAMessageStubType[m.messageStubType] : '';
  if (stub) rows.push(row('📑', 'STUB', chalk.gray(stub)));

  return [chalk.cyan('┌') + bar(), ...rows, chalk.cyan('└') + bar()].join('\n');
}

// --- bagian di bawah kotak --------------------------------------------------

async function buildBody(m, conn) {
  if (typeof m.text !== 'string' || !m.text) return '';

  const clamped = clampBody(m.text.replace(/‎+/g, ''));
  let body = clamped.text;
  if (body.length < 4096) body = highlightUrls(body);
  body = renderMarkdown(body);
  body = await resolveMentions(body, m, conn);

  body = m.error != null ? chalk.red(body) : m.isCommand ? chalk.yellow(body) : body;
  if (clamped.dropped > 0) body += chalk.dim(`\n… +${clamped.dropped} baris lagi`);

  return body
    .split('\n')
    .map((line) => GUIDE + line)
    .join('\n');
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
      return withName(jid, name);
    })
  );

  const out = resolved.filter(Boolean).join(', ');
  return out ? GUIDE + chalk.gray(out) : '';
}

function buildAttachment(m) {
  if (/document/i.test(m.mtype)) return GUIDE + chalk.dim(`📄 ${m.msg?.filename || m.msg?.displayName || 'Document'}`);
  if (/contactsArray/i.test(m.mtype)) return GUIDE + chalk.dim(`👥 ${m.msg?.contacts?.length || 0} kontak`);
  if (/contact/i.test(m.mtype)) return GUIDE + chalk.dim(`👤 ${m.msg?.displayName || 'Kontak'}`);
  return '';
}

async function renderTerminalImage(m) {
  if (!global.opts?.['img'] || !/sticker|image/gi.test(m.mtype)) return '';
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
  const senderName = senderJid ? await conn.getName(senderJid).catch(() => '') : '';
  const chat = m.chat ? await conn.getName(conn.getJid ? conn.getJid(m.chat) : m.chat).catch(() => '') : '';

  console.log(await buildBox(m, conn, { senderJid, senderName, chat }));

  for (const part of [await renderTerminalImage(m), await buildBody(m, conn), await buildStubParams(m, conn), buildAttachment(m)]) {
    if (part) console.log(part);
  }
  console.log();
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
    getName: async (jid) => (jid.startsWith('62858') ? 'Sariawan' : jid.endsWith('@g.us') ? 'Grup Kocak' : ''),
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
    return lines.join('\n').split('\n');
  };
  const text = (extra = {}) => ({ mtype: 'conversation', msg: { text: 'halo bot' }, text: 'halo bot', ...extra });
  const rowOf = (lines, label) => lines.find((line) => line.includes(label)) || '';

  // Pesan protokol tidak boleh dicetak sama sekali — ini sumber spam 'Protocol'
  assert.deepStrictEqual(await capture({ mtype: 'protocolMessage', msg: {} }), [''], 'protocolMessage harus dilewati');
  assert.deepStrictEqual(await capture({ mtype: 'senderKeyDistributionMessage', msg: {} }), [''], 'senderKeyDistribution harus dilewati');
  // ...kecuali kalau membawa stub grup (ganti subjek, dll)
  assert.ok(
    (await capture({ mtype: 'protocolMessage', msg: {}, messageStubType: 21 })).some((l) => l.includes('STUB')),
    'stub grup tetap dicetak'
  );

  // Kotak: pembuka, lima baris wajib, penutup
  const plain = await capture(text({ exp: 3 }));
  assert.ok(plain[0].startsWith('┌') && plain[0].endsWith('─'), plain[0]);
  assert.ok(
    plain.some((l) => l.startsWith('└')),
    'kotak harus ditutup'
  );
  for (const label of ['BOT', 'TIME', 'FROM', 'CHAT', 'TYPE']) {
    assert.ok(rowOf(plain, label).startsWith('│ '), `baris ${label} hilang`);
  }
  assert.ok(!plain.some((l) => l.includes('STUB')), 'baris STUB hanya untuk pesan stub');

  // Semua label dipad ke lebar yang sama, jadi kolom nilainya lurus.
  // Diuji lewat lebar padding, bukan indeks string: ⏰ (U+23F0) ada di BMP
  // sehingga panjangnya 1 char JS, sementara 🤖/👤/💬/📦 surrogate pair dan
  // panjangnya 2 — indeksnya beda walaupun di terminal semuanya selebar dua
  // kolom.
  for (const label of ['BOT', 'TIME', 'FROM', 'CHAT', 'TYPE']) {
    const line = rowOf(plain, label);
    const padding = line.slice(line.indexOf(label) + label.length).match(/^ */)[0].length;
    assert.strictEqual(padding, LABEL_WIDTH - label.length, `padding label ${label} salah`);
  }

  // Nomor bot dan pengirim diformat manusiawi, nama ikut kalau ada
  assert.ok(rowOf(plain, 'BOT').includes('+62 811-1000-222') && rowOf(plain, 'BOT').includes('~Bot'), rowOf(plain, 'BOT'));
  assert.ok(rowOf(plain, 'FROM').includes('+62 858-9100-1164') && rowOf(plain, 'FROM').includes('~Sariawan'), rowOf(plain, 'FROM'));

  // Digit LID BUKAN nomor telepon — tidak boleh diformat jadi '+224 ...'
  const lid = await capture(text({ sender: '224739230494840@lid' }));
  assert.ok(rowOf(lid, 'FROM').includes('224739230494840') && !rowOf(lid, 'FROM').includes('+224'), rowOf(lid, 'FROM'));

  // Teks biasa tidak dibubuhi ukuran palsu; media dapat ukurannya
  assert.ok(!rowOf(plain, 'TYPE').includes('B  •') && !rowOf(plain, 'TYPE').includes('0B'), rowOf(plain, 'TYPE'));
  assert.ok(rowOf(plain, 'TYPE').includes('exp:3'), rowOf(plain, 'TYPE'));

  global.DATABASE = { data: { users: { [base.sender]: { exp: 26, limit: 100 } } } };
  const media = await capture({ mtype: 'imageMessage', msg: { fileLength: { low: 45000 }, caption: 'nih' }, text: 'nih', exp: 3 });
  assert.ok(rowOf(media, 'TYPE').includes('Image') && rowOf(media, 'TYPE').includes('45.0 KB') && rowOf(media, 'TYPE').includes('limit:100'), rowOf(media, 'TYPE'));

  // Audio: durasi ikut di baris TYPE
  const ptt = await capture({ mtype: 'audioMessage', msg: { fileLength: { low: 120500 }, ptt: true, seconds: 8 } });
  assert.ok(rowOf(ptt, 'TYPE').includes('PTT') && rowOf(ptt, 'TYPE').includes('00:08') && rowOf(ptt, 'TYPE').includes('120.5 KB'), rowOf(ptt, 'TYPE'));

  // Isi pesan diberi garis pemandu
  assert.ok(
    plain.some((l) => l.startsWith('┊ ') && l.includes('halo bot')),
    plain.join(' | ')
  );

  // Pesan dari bot sendiri ditandai
  assert.ok(rowOf(await capture(text({ fromMe: true })), 'FROM').includes('[bot]'));
  assert.ok(rowOf(await capture(text({ chat: '123@g.us', isGroup: true })), 'CHAT').includes('[group]'));

  // Username pengirim, dibaca tanpa request jaringan
  assert.ok(rowOf(await capture(text({ senderUsername: 'sariawan99' })), 'FROM').includes('@sariawan99'));

  // Stub parameter berupa teks tidak boleh diresolusi jadi nama kontak, dan
  // tidak boleh jadi '~[object Promise]' karena getName tidak di-await
  const stub = await capture({ mtype: 'conversation', msg: { text: '' }, text: '', chat: '123@g.us', isGroup: true, messageStubType: 21, messageStubParameters: ['Grup Baru'] });
  const stubLine = stub.find((l) => l.includes('Grup Baru')) || '';
  assert.ok(stubLine && !stubLine.includes('~'), stubLine);
  assert.ok(!stub.join('\n').includes('Promise'), 'nama kontak harus di-await');

  // Isi yang panjang dipangkas per baris dan per jumlah baris
  const wide = 'x'.repeat(5000);
  const long = await capture(text({ text: wide, msg: { text: wide } }));
  const longBody = long.find((l) => l.includes('xxxx')) || '';
  assert.ok(longBody.length < 5000 && longBody.includes('…'), `baris panjang harus dipangkas, dapat ${longBody.length}`);

  const many = Array.from({ length: 20 }, (_, i) => `baris ${i}`).join('\n');
  const clipped = await capture(text({ text: many, msg: { text: many } }));
  assert.ok(
    clipped.some((l) => l.includes('+14 baris lagi')),
    clipped.join(' | ')
  );
  assert.ok(!clipped.some((l) => l.includes('baris 19')), 'baris di luar batas tidak dicetak');

  // Pangkasan terjadi sebelum pewarnaan, jadi tidak ada escape ANSI terpotong
  const url = `https://contoh.dev/${'a'.repeat(400)}`;
  const colored = await capture(text({ text: url, msg: { text: url } }));
  assert.strictEqual((colored.join('\n').match(/\[/g) || []).length % 2, 0, 'jumlah escape ANSI harus genap');

  console.log('print.js self-check OK');
  process.exit(0);
}
