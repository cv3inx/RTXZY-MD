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

// Selalu ada isinya, termasuk `0B` untuk pesan teks: kolomnya jadi tetap ada di
// posisi yang sama di setiap baris, lebih mudah dibaca sekilas.
function formatFileSize(bytes) {
  if (!bytes) return '0B';
  const exp = Math.floor(Math.log(bytes) / Math.log(1000));
  const size = (bytes / 1000 ** exp).toFixed(1);
  const unit = ['', ...'KMGTP'][exp] || '';
  return `${size} ${unit}B`;
}

function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  return `${Math.floor(s / 60)}`.padStart(2, '0') + ':' + `${s % 60}`.padStart(2, '0');
}

// mtype dicetak apa adanya (`conversation`, `imageMessage`) — itu nama yang
// dipakai plugin, jadi log dan kode menyebut hal yang sama. Kecuali PTT, yang
// di mtype tidak terbedakan dari audio biasa.
function formatMtype(m) {
  if (!m.mtype) return '-';
  return m.mtype === 'audioMessage' && m.msg?.ptt ? 'pttMessage' : m.mtype;
}

/**
 * `dd/mm/yy HH:MM:SS` dari stempel waktu pesannya (bukan jam saat dicetak —
 * pesan hasil sinkronisasi riwayat bisa berumur berhari-hari). Sengaja tidak
 * memakai toLocaleString('id-ID'): locale itu memakai titik sebagai pemisah jam
 * (10.29.40) yang mudah tertukar dengan tanggal.
 */
function formatTime(m) {
  const seconds = m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000;
  const d = new Date(1000 * seconds);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear() % 100)} ${d.toTimeString().slice(0, 8)}`;
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

// --- baris kepala -----------------------------------------------------------

// Tag di depan baris: penanda jenis sekaligus warna.
const TAG_PAINT = { MSG: chalk.cyan, CMD: chalk.yellow, BOT: chalk.magenta, ERR: chalk.bold.red, STUB: chalk.gray };

function tagFor(m) {
  if (m.error != null) return 'ERR';
  if (m.fromMe) return 'BOT';
  if (m.isCommand) return 'CMD';
  if (m.messageStubType && !m.text) return 'STUB';
  return 'MSG';
}

/** Digit JID tanpa akhiran server: `62895384659733@s.whatsapp.net` -> `62895384659733`. */
const jidDigits = (jid) => String(jid || '').split('@')[0];

const bracket = (value) => chalk.dim('[') + value + chalk.dim(']');

async function buildHead(m, conn, { senderJid, senderName, chat }) {
  const tag = tagFor(m);

  // Username dibaca dari cache saja: fungsi ini jalan di jalur setiap pesan,
  // jadi tidak boleh memicu request usync sendiri.
  const username = m.fromMe ? null : m.senderUsername || (conn.getUsername ? await conn.getUsername(senderJid, true) : null);

  const from = chalk.whiteBright(senderName || '-') + (username ? chalk.dim(' @' + username) : '');
  const where = chalk.cyan(chat || (m.isGroup ? '-' : 'DM'));
  const duration = m.msg?.seconds ? ' ' + chalk.dim(formatDuration(m.msg.seconds)) : '';

  // exp & limit cuma berubah saat perintah jalan, jadi tidak ikut di pesan biasa.
  const user = global.DATABASE?.data?.users?.[m.sender];
  const counters = m.isCommand ? chalk.dim(`  exp+${m.exp || 0}${user ? ` limit:${user.limit}` : ''}`) : '';

  // Nama stub datang dari proto dalam bentuk GROUP_CHANGE_SUBJECT — dijadikan
  // huruf kecil supaya tidak berteriak di tengah baris.
  const stub = m.messageStubType ? WAMessageStubType[m.messageStubType] : '';
  const stubName = stub ? chalk.gray(`  ${String(stub).replace(/_/g, ' ').toLowerCase()}`) : '';

  return `${TAG_PAINT[tag](`[ ${tag} ]`)} ${chalk.dim(formatTime(m))}  ${chalk.blueBright(formatMtype(m))}  ${chalk.dim(formatFileSize(mediaSize(m)))}${duration} ${chalk.dim('from')} ${bracket(jidDigits(senderJid))}  ${from}  ${chalk.dim('in')} ${bracket(m.chat)}  ${where}${counters}${stubName}`;
}

// --- bagian di bawah baris kepala -------------------------------------------

async function buildBody(m, conn) {
  if (typeof m.text !== 'string' || !m.text) return '';

  const clamped = clampBody(m.text.replace(/‎+/g, ''));
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
        } catch {
          // Bukan JSON: dipakai apa adanya sebagai teks.
        }
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
  return out ? chalk.gray(out) : '';
}

function buildAttachment(m) {
  if (/document/i.test(m.mtype)) return chalk.dim(`📄 ${m.msg?.filename || m.msg?.displayName || 'Document'}`);
  if (/contactsArray/i.test(m.mtype)) return chalk.dim(`👥 ${m.msg?.contacts?.length || 0} kontak`);
  if (/contact/i.test(m.mtype)) return chalk.dim(`👤 ${m.msg?.displayName || 'Kontak'}`);
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
  // Nama chat cuma dipakai untuk grup, jadi jangan dicari untuk DM.
  const chat = m.isGroup ? await conn.getName(conn.getJid ? conn.getJid(m.chat) : m.chat).catch(() => '') : '';

  console.log(await buildHead(m, conn, { senderJid, senderName, chat }));

  for (const part of [await renderTerminalImage(m), await buildBody(m, conn), await buildStubParams(m, conn), buildAttachment(m)]) {
    if (part) console.log(part);
  }
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
  const base = { sender: '6285891001164@s.whatsapp.net', chat: '6285891001164@s.whatsapp.net', messageTimestamp: { low: Math.floor(Date.now() / 1000) } };
  // Warna dibuang sebelum diperiksa: kalau self-check dijalankan di terminal,
  // chalk menyisipkan escape yang menggeser semua indeks kolom.
  const strip = (line) => line.replace(/\[[0-9;]*m/g, '');

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
  const headOf = (lines) => strip(lines[0]);
  const tagOf = (lines) => (headOf(lines).match(/^\[ (\w+) \]/) || [])[1] || '';

  // Pesan protokol tidak boleh dicetak sama sekali — ini sumber spam 'Protocol'
  assert.deepStrictEqual(await capture({ mtype: 'protocolMessage', msg: {} }), [''], 'protocolMessage harus dilewati');
  assert.deepStrictEqual(await capture({ mtype: 'senderKeyDistributionMessage', msg: {} }), [''], 'senderKeyDistribution harus dilewati');
  // ...kecuali kalau membawa stub grup (ganti subjek, dll)
  assert.strictEqual(tagOf(await capture({ mtype: 'protocolMessage', msg: {}, messageStubType: 21 })), 'STUB', 'stub grup tetap dicetak');

  // Bentuk baris kepala, diperiksa utuh sekali supaya urutan & spasinya terjaga:
  //   [ MSG ] 02/09/26 10:29:40  conversation  0B from [62..]  Nama  in [62..@s.whatsapp.net]  DM
  const plain = await capture(text());
  assert.strictEqual(plain.length, 2, `satu pesan = 2 baris, dapat ${plain.length}: ${plain.join(' | ')}`);
  assert.match(headOf(plain), /^\[ MSG \] \d\d\/\d\d\/\d\d \d\d:\d\d:\d\d {2}conversation {2}0B from \[6285891001164\] {2}Sariawan {2}in \[6285891001164@s\.whatsapp\.net\] {2}DM$/, headOf(plain));
  assert.strictEqual(plain[1], 'halo bot', 'isi pesan rata kiri di baris berikutnya');
  assert.ok(!/[┌│└┊›]/.test(strip(plain.join('\n'))), 'kotak & panah dari format lama sudah tidak dipakai');

  // Grup: nama grup di belakang JID-nya
  const group = await capture(text({ chat: '120363409859597609@g.us', isGroup: true }));
  assert.ok(headOf(group).includes('in [120363409859597609@g.us]  Grup Kocak'), headOf(group));

  // Digit LID BUKAN nomor telepon — tidak boleh diformat jadi '+224 ...'
  const lid = await capture(text({ sender: '224739230494840@lid' }));
  assert.ok(headOf(lid).includes('from [224739230494840]') && !headOf(lid).includes('+224'), headOf(lid));

  // Tag membedakan jenis baris supaya bisa di-grep
  assert.strictEqual(tagOf(await capture(text({ fromMe: true }))), 'BOT');
  assert.strictEqual(tagOf(await capture(text({ isCommand: true }))), 'CMD');
  assert.strictEqual(tagOf(await capture(text({ error: new Error('gagal') }))), 'ERR');

  // exp & limit hanya untuk perintah: di pesan biasa keduanya cuma derau
  global.DATABASE = { data: { users: { [base.sender]: { exp: 26, limit: 100 } } } };
  const cmd = await capture(text({ isCommand: true, exp: 17, text: '.ping', msg: { text: '.ping' } }));
  assert.ok(headOf(cmd).includes('exp+17') && headOf(cmd).includes('limit:100'), headOf(cmd));
  const chatty = await capture(text({ exp: 17 }));
  assert.ok(!headOf(chatty).includes('exp+') && !headOf(chatty).includes('limit:'), headOf(chatty));

  // Media: mtype apa adanya, plus ukuran dan durasi
  const media = await capture({ mtype: 'imageMessage', msg: { fileLength: { low: 45000 }, caption: 'nih' }, text: 'nih' });
  assert.ok(headOf(media).includes('imageMessage  45.0 KB'), headOf(media));
  // Voice note tidak terbedakan dari audio biasa di mtype, jadi dibedakan di sini
  const ptt = await capture({ mtype: 'audioMessage', msg: { fileLength: { low: 120500 }, ptt: true, seconds: 8 } });
  assert.ok(headOf(ptt).includes('pttMessage  120.5 KB 00:08'), headOf(ptt));

  // Username pengirim, dibaca tanpa request jaringan
  assert.ok(headOf(await capture(text({ senderUsername: 'sariawan99' }))).includes('@sariawan99'));

  // Stempel waktu diambil dari pesannya, bukan jam saat dicetak: pesan hasil
  // sinkronisasi riwayat harus tampil dengan tanggal aslinya.
  assert.ok(headOf(await capture(text({ messageTimestamp: { low: 1755245247 } }))).startsWith('[ MSG ] 15/08/25 '), headOf(await capture(text({ messageTimestamp: { low: 1755245247 } }))));

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
  assert.ok(
    clipped.slice(1).every((l) => !/^\s/.test(strip(l))),
    'isi pesan rata kiri, tidak ada baris yang menjorok'
  );

  // Pangkasan terjadi sebelum pewarnaan, jadi tidak ada escape ANSI terpotong
  const url = `https://contoh.dev/${'a'.repeat(400)}`;
  const colored = await capture(text({ text: url, msg: { text: url } }));
  assert.strictEqual((colored.join('\n').match(/\[/g) || []).length % 2, 0, 'jumlah escape ANSI harus genap');

  console.log('print.js self-check OK');
  process.exit(0);
}
