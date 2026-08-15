import fetch from 'node-fetch';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer as fromBuffer } from 'file-type';
import log from '../system/log.js';

const tele = async (buffer) => {
  const { ext } = await fromBuffer(buffer);
  let form = new FormData();
  form.append('file', buffer, 'tmp.' + ext);
  let res = await fetch('https://telegra.ph/upload?source=bugtracker', {
    method: 'POST',
    body: form
  });
  let img = await res.json();
  if (img.error) throw img.error;
  return 'https://telegra.ph' + img[0].src;
};

const ugu = async (buffer) => {
  const { ext } = await fromBuffer(buffer);
  let form = new FormData();
  form.append('files[]', buffer, 'tmp.' + ext);
  let up = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: form,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)'
    }
  });
  let res = await up.json();
  return res.files?.[0]?.url || '';
};

const catbox = async (buffer) => {
  const { ext } = (await fromBuffer(buffer)) || {};
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`);
  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity
  });
  return res.data;
};

const api = async (buffer, originalName = 'file') => {
  let { ext } = (await fromBuffer(buffer)) || {};
  if (!ext && originalName.includes('.')) {
    ext = originalName.split('.').pop();
  }
  ext = ext || 'bin';

  let bodyForm = new FormData();
  bodyForm.append('file', buffer, `${originalName}.${ext}`);
  let res = await fetch('https://file.botcahx.eu.org/api/upload.php', {
    method: 'post',
    body: bodyForm
  });

  let data = await res.json();
  let resultUrl = data.result ? data.result.url : '';
  return resultUrl;
};

// Host diurutkan per tipe media: telegra.ph hanya menerima gambar, uguu tidak
// dipakai untuk gambar di urutan pertama karena file-nya kedaluwarsa.
const HOSTS = { image: [tele, ugu, catbox, api], video: [ugu, catbox, api], other: [catbox, api] };

/**
 * Unggah buffer ke host pertama yang berhasil. Mengembalikan null kalau semua
 * gagal — banyak pemanggil sudah mengecek null, jadi kegagalan tidak dilempar.
 * Sebelumnya tiap host punya `catch {}` sendiri, jadi kegagalan total balik
 * sebagai null tanpa jejak apa pun dan pemanggil melapor error yang salah.
 */
export default async (buffer) => {
  const { mime } = (await fromBuffer(buffer)) || {};
  const hosts = mime?.startsWith('image/') ? HOSTS.image : mime?.startsWith('video/') ? HOSTS.video : HOSTS.other;

  const failures = [];
  for (const host of hosts) {
    try {
      const url = await host(buffer);
      if (url) return url;
      failures.push(`${host.name}: balasan kosong`);
    } catch (e) {
      failures.push(`${host.name}: ${e?.message || e}`);
    }
  }

  log.error(`Unggah gagal di semua host (${mime || 'mime tidak dikenal'})`);
  for (const failure of failures) log.detail(failure);
  return null;
};
