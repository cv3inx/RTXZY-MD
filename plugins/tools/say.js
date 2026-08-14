const handler = {
  help: ['say'],
  usage: 'teks',
  tags: ['tools'],
  command: 'say',
  run: async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Harap masukkan text!\n\ncontoh:\n${usedPrefix + command} Haruno`;
    conn.reply(m.chat, text, null);
  }
};

export default handler;
