const handler = {
  command: 'tbok',
  limit: true,
  run: async (m, { conn }) => {
    conn.tebaktokoh = conn.tebaktokoh ? conn.tebaktokoh : {};
    let id = m.chat;
    if (!(id in conn.tebaktokoh)) throw false;
    let json = conn.tebaktokoh[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
