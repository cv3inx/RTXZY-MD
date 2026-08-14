const handler = {
  command: /^tbcl$/i,
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakclub = conn.tebakclub ? conn.tebakclub : {};
    let id = m.chat;
    if (!(id in conn.tebakclub)) throw false;
    let json = conn.tebakclub[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
