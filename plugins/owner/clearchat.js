const handler = {
  help: ['deletechat'],
  tags: ['owner'],
  command: ['deletechat', 'delchat', 'dchat', 'clearchat', 'cleanchat'],
  owner: true,
  run: async (m, { conn }) => {
    conn.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] }, m.chat);
    let a = await m.reply('Successfully deleted this chat!');
  }
};

export default handler;
