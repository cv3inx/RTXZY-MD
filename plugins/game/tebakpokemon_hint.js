const handler = {
  command: /^tebpo$/i,
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakpokemon = conn.tebakpokemon ? conn.tebakpokemon : {};
    let id = m.chat;
    if (!(id in conn.tebakpokemon)) throw false;
    let json = conn.tebakpokemon[id][1];
    m.reply('```' + json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_') + '```\n*BALAS SOALNYA, BUKAN PESAN INI!*');
  }
};

export default handler;
