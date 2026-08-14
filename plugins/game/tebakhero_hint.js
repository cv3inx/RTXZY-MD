const handler = {
  command: 'tml',
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakml = conn.tebakml ? conn.tebakml : {};
    let id = m.chat;
    if (!(id in conn.tebakml)) throw false;
    let json = conn.tebakml[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
