import fetch from 'node-fetch';
const handler = {
  command: ['aimusiclyrics', 'ailirik', 'lyricsgen'],
  help: ['aimusiclyrics', 'ailirik', 'lyricsgen'],
  tags: ['ai'],
  owner: false,
  limit: true,
  group: false,
  private: false,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan prompt lirik!\nContoh: ${usedPrefix + command} salahkah aku`;

    try {
      m.reply(`⏳ Tunggu sebentar, sedang membuat lirik...`);

      const url = Api.url('/api/maker/generateLirik', { prompt: text, aksesKey });
      const res = await fetch(url);
      const json = await res.json();

      if (!json.status || !json.result || !Array.isArray(json.result)) {
        throw new Error('Gagal mendapatkan lirik.');
      }

      const jumlahLirik = json.result.length;

      for (let i = 0; i < jumlahLirik; i++) {
        const lirik = json.result[i].text;
        await m.reply(lirik);
      }
    } catch (e) {
      console.error(e);
      m.reply('❌ Terjadi kesalahan saat membuat lirik.');
    }
  }
};

export default handler;
