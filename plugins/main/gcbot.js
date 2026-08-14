const handler = {
  help: ['gcbot'],
  tags: ['main'],
  command: 'gcbot',
  run: async (m, { conn }) => {
    conn.reply(m.chat, gc, m);
  }
};

export default handler;
