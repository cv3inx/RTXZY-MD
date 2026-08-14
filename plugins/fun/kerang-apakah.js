const handler = {
  help: ['apakah <teks>?'],
  tags: ['kerang'],
  customPrefix: /(\?$)/,
  command: /^apakah$/i,
  owner: false,
  fail: null,
  run: async (m, { conn, text }) => {
    conn.reply(
      m.chat,
      `${pickRandom(['Yap', 'Sepertinya Begitu', 'Kayaknya', 'Kayaknya nggak', 'Nggak', 'Nggak mungkin'])}
`.trim(),
      m,
      m.mentionedJid
        ? {
            contextInfo: {
              mentionedJid: m.mentionedJid
            }
          }
        : {}
    );
  }
};

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
