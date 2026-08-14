let timeout = 100000;
let poin = 10000;

const handler = {
  help: ['tebakhewan'],
  tags: ['game'],
  command: /^tebakhewan/i,
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {};
    let id = m.chat;
    if (id in conn.tebakhewan) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakhewan[id][0]);
      throw false;
    }

    let json;
    try {
      json = await (await Api.get('/api/game/tebakhewan')).json();
    } catch (e) {
      console.error(e);
      throw 'Gagal mengambil data dari API, coba lagi nanti.';
    }

    // Pastikan API memberikan hasil yang valid
    if (!json || !json.img || !json.jawaban) throw 'Terjadi kesalahan, API tidak memberikan data yang valid!';

    let caption = `
≡ _GAME TEBAK HEWAN

┌─⊷ *SOAL*
▢ Deskripsi HEWAN: *${json.deskripsi}*
▢ Clue: *${json.clue}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}hhew untuk clue jawaban
▢ *REPLAY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakhewan[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakhewan[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakhewan[id][0]);
        delete conn.tebakhewan[id];
      }, timeout)
    ];
  }
};

export default handler;
