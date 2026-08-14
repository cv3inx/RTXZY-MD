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

const handler = {
  help: ['salat <daerah>'],
  tags: ['islam'],
  command: /^(jadwal)?s(a|o|ha|ho)lat$/i,
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Gunakan contoh: ${usedPrefix}${command} semarang`;

    try {
      const res = await (await Api.get('/api/tools/jadwalshalat', { kota: text })).json();

      if (!res.status || res.result.code !== 200) {
        throw 'Error: API response tidak valid';
      }

      const prayerTimes = getPrayerTimes(res);

      if (prayerTimes) {
        let timings = prayerTimes.timings;
        let jadwalSholat = Object.entries(timings)
          .map(([name, time]) => `*${name}:* ${time}`)
          .join('\n');

        let message = `
Jadwal Sholat untuk *${text}*
${jadwalSholat}
`.trim();

        m.reply(message);
      } else {
        throw 'Error: Tidak ada data untuk tanggal hari ini';
      }
    } catch (error) {
      m.reply('Terjadi kesalahan: ' + error);
    }
  }
};

export default handler;
