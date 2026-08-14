let timeout = 100000;
let poin = 10000;

const handler = {
  help: ['tebakpokemon'],
  tags: ['game'],
  command: 'tebakpokemon',
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakpokemon = conn.tebakpokemon ? conn.tebakpokemon : {};
    let id = m.chat;
    if (id in conn.tebakpokemon) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakpokemon[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakpokemon')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
≡ _GAME TEBAK MAKANAN_

┌─⊷ *SOAL*
▢ Penjelasan: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tebpo untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakpokemon[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakpokemon[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakpokemon[id][0]);
        delete conn.tebakpokemon[id];
      }, timeout)
    ];
  }
};

export default handler;
