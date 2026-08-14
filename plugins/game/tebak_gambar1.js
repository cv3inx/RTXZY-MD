let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakgambar'],
  tags: ['game'],
  command: /^tebakgambar/i,
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {};
    let id = m.chat;
    if (id in conn.tebakgambar) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakgambar[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakgambar')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
≡ _GAME TEBAK GAMBAR_

┌─⊷ *SOAL*
▢ Penjelasan: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}hint untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakgambar[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakgambar[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakgambar[id][0]);
        delete conn.tebakgambar[id];
      }, timeout)
    ];
  }
};

export default handler;
