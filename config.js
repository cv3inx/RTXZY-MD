// Baca file .env kalau ada, supaya API key tidak ikut ter-commit.
// Lihat .env.example untuk daftar variabelnya.
import 'dotenv/config';

// Timezone
process.env.TZ = 'Asia/Jakarta';

// ============================================================
// Pengaturan Bot — isi semua yang wajib, sisanya opsional.
// ============================================================
const config = {
  owner: {
    number: '628988293493', // wajib diisi
    name: 'DitzzyAF', // wajib diisi
    mail: 'ditzzyaf@gmail.com'
  },
  usePair: false, //  true = pakai pairing code, false = pakai qr code
  botNumber: '',
  pairingCode: 'ABCD1234', // wajib 8 digit kode unik

  // Karakter prefix yang dikenali bot, satu karakter per entry.
  prefix: ['.', '#', '!', '/'],

  // Tempat penyimpanan database bot (users, chats, stats, dll).
  //   'sqlite'  -> database/database.sqlite (default, WAL)
  //   'json'    -> database/database.json
  //   'mongodb' -> wajib isi mongoUrl di bawah
  // Data dari database.json lama di root diimpor sekali otomatis.
  // Argumen --db saat menjalankan bot menimpa pilihan ini.
  database: {
    type: 'sqlite',
    mongoUrl: '' // contoh: mongodb://user:pass@host:27017/bot
  },

  access: {
    owner: ['628988293493'], // wajib diisi
    mods: ['628988293493'], // wajib diisi
    prems: ['628988293493'] // wajib diisi
  },

  links: {
    group: 'https://chat.whatsapp.com/I5RpePh2b5u37OyFjzCNTr', // wajib diisi
    instagram: 'https://instagram.com/prm2.0' // wajib diisi
  },

  branding: {
    watermark: '© VLTCX', // nama bot/kamu
    stickerPackname: 'Made With',
    stickerAuthor: 'Bot WhatsApp',
    thumb: 'https://telegra.ph/file/3a34bfa58714bdef500d9.jpg'
  },

  messages: {
    wait: '_*Tunggu sedang di proses...*_',
    error: '_*Server Error*_',
    stickerWait: '*⫹⫺ Stiker sedang dibuat...*'
  },

  maxWarn: 5,

  // Key wajib diisi, sisanya opsional (isi kalo perlu fitur terkait).
  // Semua key bisa diisi lewat .env supaya tidak ikut ter-commit — nilai di
  // file ini cuma dipakai kalau variabel .env-nya kosong.
  api: {
    botcahx: {
      url: 'https://api.botcahx.eu.org', // wajib diisi
      key: process.env.BOTCAHX_APIKEY || 'YOUR_APIKEY_HERE', // wajib diisi
      akseskey: process.env.BOTCAHX_AKSESKEY || 'YOUR_AKSESKEY_HERE' // opsional — suno ai (ai music) & fitur prem lainnya
    },
    whoisJson: {
      url: 'https://whoisjson.com/api/v1', // wajib diisi
      key: process.env.WHOISJSON_KEY || 'YOUR_WHOISJSON_KEY_HERE' // fitur .whois2, daftar gratis di whoisjson.com
    }
  }
};

global.config = config;

// Alias global lama.
//
// Sebelum config.js direstrukturisasi jadi objek bertingkat, plugin memakai nama
// pendek ini langsung (`m.reply(wait)`, `${wm}`, `owner.map(...)`). Ratusan
// plugin masih memakainya dan ESM selalu strict mode, jadi membacanya tanpa
// definisi bukan `undefined` melainkan ReferenceError yang mematikan perintahnya.
//
// Dipasang sebagai getter, bukan salinan nilai, supaya tetap ikut berubah saat
// config.js di-hot-reload — `config` di atas tetap satu-satunya sumber kebenaran.
const legacyAliases = {
  // messages
  wait: () => config.messages.wait,
  eror: () => config.messages.error,
  stiker_wait: () => config.messages.stickerWait,
  // branding
  wm: () => config.branding.watermark,
  packname: () => config.branding.stickerPackname,
  author: () => config.branding.stickerAuthor,
  thumb: () => config.branding.thumb,
  // owner & akses
  owner: () => config.access.owner,
  numberowner: () => config.owner.number,
  nameowner: () => config.owner.name,
  mail: () => config.owner.mail,
  // links
  gc: () => config.links.group,
  instagram: () => config.links.instagram,
  // api
  btc: () => config.api.botcahx.key,
  aksesKey: () => config.api.botcahx.akseskey,
  // Dipakai handler.js untuk menyensor key yang bocor ke teks error.
  APIKeys: () =>
    Object.values(config.api)
      .flatMap((service) => [service.key, service.akseskey])
      .filter(Boolean)
};

for (const [name, read] of Object.entries(legacyAliases)) {
  Object.defineProperty(globalThis, name, { get: read, configurable: true });
}

import fs from 'fs';
import { pathToFileURL } from 'url';
import log from './lib/system/log.js';
const file = import.meta.filename;
fs.unwatchFile(file);
fs.watchFile(file, async () => {
  fs.unwatchFile(file);
  log.reload('config.js');
  await import(pathToFileURL(file).href + '?update=' + Date.now());
});
