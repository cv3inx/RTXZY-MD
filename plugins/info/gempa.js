const handler = {
  command: ['infogempa', 'gempa'],
  help: ['infogempa', 'gempa'],
  tags: ['info'],
  premium: false,
  limit: true,
  run: async (m, { conn, Api }) => {
    try {
      var response = await Api.get('/api/search/gempa')
        .then((r) => r.json())
        .then((data) => ({ data }));
      var dataGempa = response.data.result.result;
      var caption = `Waktu : ${dataGempa.waktu}\nLintang : ${dataGempa.Lintang}\nBujur : ${dataGempa.Bujur}\nMagnitude : ${dataGempa.Magnitudo}\nKedalaman : ${dataGempa.Kedalaman}\nWilayah : ${dataGempa.Wilayah}`;
      conn.sendFile(m.chat, dataGempa.image, 'map.png', caption, m);
    } catch (e) {
      console.log(e);
      conn.reply(m.chat, 'Terjadi kesalahan saat mengambil data gempa', m);
    }
  }
};
export default handler;
