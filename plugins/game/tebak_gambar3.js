const handler = {
  command: /^hint$/i,
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakgambar = conn.tebakgambar ? conn.tebakgambar : {};
    let id = m.chat;
    if (!(id in conn.tebakgambar)) throw false;
    let json = conn.tebakgambar[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
