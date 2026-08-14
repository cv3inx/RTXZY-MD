const handler = {
  command: /^tbam$/i,
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakanime = conn.tebakanime ? conn.tebakanime : {};
    let id = m.chat;
    if (!(id in conn.tebakanime)) throw false;
    let json = conn.tebakanime[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
