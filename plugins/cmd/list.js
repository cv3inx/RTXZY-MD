const handler = {
  help: ['listcmd'],
  tags: ['database', 'premium'],
  command: ['listcmd', 'infocmd'],
  run: async (m, { conn }) => {
    conn.reply(
      m.chat,
      `
*DAFTAR HASH*
\`\`\`
${Object.entries(global.db.data.sticker)
  .map(([key, value], index) => `${index + 1}. ${value.locked ? `(Terkunci) ${key}` : key} : ${value.text}`)
  .join('\n')}
\`\`\`
`.trim(),
      null,
      {
        mentions: Object.values(global.db.data.sticker)
          .map((x) => x.mentionedJid)
          .reduce((a, b) => [...a, ...b], [])
      }
    );
  }
};

export default handler;
