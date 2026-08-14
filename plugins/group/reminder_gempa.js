import axios from 'axios';
import { setInterval } from 'timers';
import Api from '../../lib/system/api.js';

let lastGempaData = null;

async function getGempaInfo() {
  try {
    const url = Api.url('/api/search/gempa');
    const response = await axios.get(url);
    const res = response.data.result.result;

    if (!res) {
      console.log('Data gempa tidak tersedia');
      return;
    }

    if (lastGempaData && lastGempaData.waktu === res.waktu) {
      console.log('Data gempa belum berubah, tidak ada pengingat.');
      return;
    }

    lastGempaData = res;

    const gempaInfo = {
      waktu: res.waktu,
      lintang: res.Lintang,
      bujur: res.Bujur,
      magnitude: res.Magnitudo,
      kedalaman: res.Kedalaman,
      wilayah: res.Wilayah,
      potensi: res.Potensi,
      gambar: res.image
    };

    console.log(`
        Waktu Gempa: ${gempaInfo.waktu}
        Magnitudo: ${gempaInfo.magnitude}
        Wilayah: ${gempaInfo.wilayah}
        Potensi: ${gempaInfo.potensi}
        Gambar: ${gempaInfo.gambar}
        `);

    sendGempaReminderToGroups(gempaInfo);
  } catch (error) {
    console.error('[❗] Terjadi kesalahan saat mengambil data gempa:', error);
    await notifyOwnerOfFailure('gempa', error);
  }
}

async function notifyOwnerOfFailure(feature, error) {
  for (const jid of (global.owner || []).map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')) {
    await conn.sendMessage(jid, { text: `[❗] Reminder ${feature} gagal ambil data:\n${error}` }).catch(() => {});
  }
}

async function sendGempaReminderToGroups(gempaInfo) {
  for (const chatId of Object.keys(global.db.data.chats)) {
    const chat = global.db.data.chats[chatId];
    if (chat.notifgempa) {
      const reminderMessage = `🚨 *PENGINGAT GEMPA BUMI* 🚨\n\n🕒 Waktu: ${gempaInfo.waktu}\n🌍 Wilayah: ${gempaInfo.wilayah}\n💥 Magnitudo: ${gempaInfo.magnitude}\n🌐 Lintang: ${gempaInfo.lintang}\n🌐 Bujur: ${gempaInfo.bujur}\n🔍 Kedalaman: ${gempaInfo.kedalaman}\n🌊 Potensi: ${gempaInfo.potensi}\n📷 Gambar Peta: ${gempaInfo.gambar}\n\nJaga keselamatan kalian!`;
      await sendReminderToGroup(chatId, reminderMessage);
    }
  }
}

async function sendReminderToGroup(chatId, text) {
  await conn.sendMessage(chatId, { text });
}

function startGempaReminder() {
  setInterval(
    () => {
      console.log('Mengecek data gempa terbaru...');
      getGempaInfo();
    },
    60 * 60 * 1000
  );
}

startGempaReminder();
