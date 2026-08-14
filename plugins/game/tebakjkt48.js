let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakjkt'],
  tags: ['game'],
  command: 'tebakjkt',
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakjkt = conn.tebakjkt ? conn.tebakjkt : {};
    let id = m.chat;
    if (id in conn.tebakjkt) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakjkt[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakjkt48')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
≡ _GAME TEBAK GAMBAR_

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}jkcu untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakjkt[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakjkt[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakjkt[id][0]);
        delete conn.tebakjkt[id];
      }, timeout)
    ];
  }
};

export default handler;
