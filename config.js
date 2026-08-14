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

  botNumber: '6285891001164',
  pairingCode: 'ABCD1234', // wajib 8 digit kode unik

  // Karakter prefix yang dikenali bot, satu karakter per entry.
  prefix: ['.', '#', '!', '/'],

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
  api: {
    botcahx: {
      url: 'https://api.botcahx.eu.org', // wajib diisi
      key: 'YOUR_APIKEY_HERE', // wajib diisi
      akseskey: 'YOUR_AKSESKEY_HERE' // opsional — suno ai (ai music) & fitur prem lainnya
    },
    whoisJson: {
      url: 'https://whoisjson.com/api/v1', // wajib diisi
      key: '6c7bd1ce704d92c90e2f78d42641a9ee0cbcef198a6ad62a3dd06deb22af6fd3' // fitur .whois2, ganti punya sendiri kalo abis kuota
    }
  }
};

global.config = config;

import fs from 'fs';
import chalk from 'chalk';
import { pathToFileURL } from 'url';
const file = import.meta.filename;
fs.unwatchFile(file);
fs.watchFile(file, async () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  await import(pathToFileURL(file).href + '?update=' + Date.now());
});
