let timeout = 100000;
let poin = 500;
const handler = {
  help: ['tebakjenaka'],
  tags: ['game'],
  command: /^tebakjenaka/i,
  register: false,
  group: false,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakjenaka = conn.tebakjenaka ? conn.tebakjenaka : {};
    let id = m.chat;
    if (id in conn.tebakjenaka) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakjenaka[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebakjenaka')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.pertanyaan}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tbk untuk bantuan
▢ Bonus: ${poin} Kredit sosial
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tebakjenaka[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakjenaka[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakjenaka[id][0]);
        delete conn.tebakjenaka[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133
