import axios from 'axios';
import Api from '../../lib/system/api.js';

let location = 'Jakarta';

async function getWeatherInfo() {
  try {
    const url = Api.url('/api/tools/cuaca', { query: location });
    const response = await axios.get(url);
    const res = response.result;

    if (!res) {
      console.log('Data cuaca tidak tersedia');
      return;
    }
    const weatherInfo = {
      location: res.location,
      country: res.country,
      weather: res.kondisi,
      currentTemp: res.currentTemp,
      maxTemp: res.maxTemp,
      minTemp: res.minTemp,
      humidity: res.humidity,
      windSpeed: res.angin
    };

    console.log(`
        Lokasi: ${weatherInfo.location}
        Cuaca: ${weatherInfo.weather}
        Suhu saat ini: ${weatherInfo.currentTemp}
        Suhu tertinggi: ${weatherInfo.maxTemp}
        Suhu terendah: ${weatherInfo.minTemp}
        Kelembapan: ${weatherInfo.humidity}
        Angin: ${weatherInfo.windSpeed}
        `);

    sendWeatherReminderToGroups(weatherInfo);
  } catch (error) {
    console.error('[❗] Terjadi kesalahan saat mengambil data cuaca:', error);
    await notifyOwnerOfFailure('cuaca', error);
  }
}

async function notifyOwnerOfFailure(feature, error) {
  for (const jid of (global.config.access.owner || []).map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')) {
    await conn.sendMessage(jid, { text: `[❗] Reminder ${feature} gagal ambil data:\n${error}` }).catch(() => {});
  }
}

async function sendWeatherReminderToGroups(weatherInfo) {
  for (const chatId of Object.keys(global.db.data.chats)) {
    const chat = global.db.data.chats[chatId];
    if (chat.notifcuaca) {
      const reminderMessage = `🌤️ *PENGINGAT CUACA* 🌤️\n\n📍 Lokasi: ${weatherInfo.location}\n🌍 Negara: ${weatherInfo.country}\n🌦️ Cuaca: ${weatherInfo.weather}\n🌡️ Suhu saat ini: ${weatherInfo.currentTemp}\n🌡️ Suhu tertinggi: ${weatherInfo.maxTemp}\n🌡️ Suhu terendah: ${weatherInfo.minTemp}\n💧 Kelembapan: ${weatherInfo.humidity}\n🌬️ Angin: ${weatherInfo.windSpeed}\n\nTetap waspada dan jaga kesehatan!`;
      await sendReminderToGroup(chatId, reminderMessage);
    }
  }
}

async function sendReminderToGroup(chatId, text) {
  await conn.sendMessage(chatId, { text }); // Kirim pesan langsung ke grup
}

// Jam kirim pengingat. Ganti sesuai kebutuhan.
const JAM_KIRIM = [7, 12, 18];

function checkTimeAndSendWeather() {
  const now = new Date();
  const hours = now.getHours();

  if (!JAM_KIRIM.includes(hours)) return;
  // Pengecekan jalan tiap menit, jadi tanpa penanda ini satu jam kirim bisa
  // terpicu lebih dari sekali.
  if (global.__reminderCuacaJam === hours) return;
  global.__reminderCuacaJam = hours;

  console.log('Mengambil data cuaca terbaru...');
  getWeatherInfo();
}

// Hot reload meng-import ulang file ini dan menjalankan top-level-nya sekali
// lagi. Tanpa membersihkan timer lama, tiap reload menambah satu interval baru
// dan pengingatnya terkirim berkali-kali.
clearInterval(global.__reminderCuacaTimer);
global.__reminderCuacaTimer = setInterval(checkTimeAndSendWeather, 60 * 1000);
