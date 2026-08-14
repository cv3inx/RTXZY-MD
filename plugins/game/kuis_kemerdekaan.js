let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['kuismerdeka'],
  tags: ['game'],
  command: /^kuismerdeka/i,
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.merdeka = conn.merdeka ? conn.merdeka : {};
    let id = m.chat;
    if (id in conn.merdeka) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.merdeka[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/kuismerdeka')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}mka untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim();
    conn.merdeka[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.merdeka[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.merdeka[id][0]);
        delete conn.merdeka[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.7.9 dan sharp versi 0.30.5
// danaputra133
