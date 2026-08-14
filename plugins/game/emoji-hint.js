const handler = {
  command: /^hemo$/i,
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {};
    let id = m.chat;
    if (!(id in conn.tebakemoji)) throw false;
    let json = conn.tebakemoji[id][1];
    conn.reply(m.chat, '```' + json.jawaban.replace(/[AIUEOaiueo]/gi, '_') + '```', m);
  }
};

export default handler;

//danaputra133
