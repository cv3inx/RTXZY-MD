const handler = {
  help: ['tagme'],
  tags: ['group'],
  command: /^tagme$/i,
  group: true,
  run: async (m, { conn, text }) => {
    let orang = (await conn.groupMetadata(m.chat)).participants.map((u) => u.jid);
    let tag = `@${m.sender.replace(/@.+/, '')}`;
    let mentionedJid = [m.sender];

    conn.reply(m.chat, tag, m, { contextInfo: { mentionedJid } });
  }
};

export default handler;
