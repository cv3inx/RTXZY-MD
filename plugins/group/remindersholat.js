import axios from 'axios';
import Api from '../../lib/system/api.js';

async function getPrayerTimesAndSetReminders() {
  try {
    let city = 'jakarta';
    let url = Api.url('/api/tools/jadwalshalat', { kota: city });
    let response = await axios.get(url);

    let data = response.data;
    if (!data || data.result.code !== 200) {
      return;
    }

    const prayerTimes = getPrayerTimes(data);

    if (prayerTimes) {
      let jadwal = prayerTimes.timings;
      setPrayerTimers(jadwal);
    }
  } catch (error) {
    // diam adalah emas 😭😂
  }
}

function getPrayerTimes(jsonData) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const todayString = `${day}-${month}-${year}`;

  for (const item of jsonData.result.data) {
    if (item.date.gregorian.date === todayString) {
      return item;
    }
  }
  return null;
}

function setPrayerTimers(jadwal) {
  let now = new Date();

  // Fungsi ini dipanggil ulang tiap 6 jam dan tiap hot reload. Tanpa penanda
  // ini, satu waktu sholat dijadwalkan berkali-kali dan pengingatnya dobel.
  const hari = now.toDateString();
  if (global.__reminderSholatHari !== hari) {
    global.__reminderSholatHari = hari;
    global.__reminderSholatTerjadwal = new Set();
  }
  const terjadwal = (global.__reminderSholatTerjadwal ||= new Set());

  function calculateTimeDifference(prayerTime) {
    let cleanTime = prayerTime.replace(' (WIB)', '');
    let [hours, minutes] = cleanTime.split(':').map(Number);
    let prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return prayerDate.getTime() - now.getTime();
  }

  let prayerTimes = [
    { name: 'Subuh', time: jadwal.Fajr },
    { name: 'Dzuhur', time: jadwal.Dhuhr },
    { name: 'Ashar', time: jadwal.Asr },
    { name: 'Maghrib', time: jadwal.Maghrib },
    { name: 'Isya', time: jadwal.Isha }
  ];

  for (let prayer of prayerTimes) {
    let timeDifference = calculateTimeDifference(prayer.time);
    if (timeDifference <= 0 || terjadwal.has(prayer.name)) continue;

    terjadwal.add(prayer.name);
    setTimeout(() => {
      sendPrayerReminderToGroups(prayer.name, prayer.time);
    }, timeDifference);
  }
}

async function sendPrayerReminderToGroups(prayerName, prayerTime) {
  for (const chatId of Object.keys(global.db.data.chats)) {
    const chat = global.db.data.chats[chatId];
    if (chat.notifsholat) {
      const reminderMessage = `⏰ *PENGINGAT SHOLAT*\n\n🚨 Waktu Sholat ${prayerName} telah tiba!\nJam: ${prayerTime}\nJangan lupa untuk melaksanakan sholat.`;
      await sendReminderToGroup(chatId, reminderMessage);
    }
  }
}

async function sendReminderToGroup(chatId, text) {
  await conn.sendMessage(chatId, { text });
}

// Hot reload meng-import ulang file ini dan menjalankan top-level-nya sekali
// lagi. Tanpa membersihkan timer lama, tiap reload menambah satu interval baru.
clearInterval(global.__reminderSholatTimer);
global.__reminderSholatTimer = setInterval(getPrayerTimesAndSetReminders, 6 * 60 * 60 * 1000); // setiap 6 jam
getPrayerTimesAndSetReminders();
