let timeout = 100000;
let poin = 1000;
const handler = {
  help: ['tebakml'],
  tags: ['game'],
  command: 'tebakml',
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakml = conn.tebakml ? conn.tebakml : {};
    let id = m.chat;
    if (id in conn.tebakml) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakml[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakheroml')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
≡ _TEBAK HERO ML_

┌─⊷ *SOAL*
▢ Deskripsi: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tml untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakml[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.fullimg }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakml[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakml[id][0]);
        delete conn.tebakml[id];
      }, timeout)
    ];
  }
};

export default handler;
