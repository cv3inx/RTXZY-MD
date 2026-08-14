const handler = {
  help: ['totalfitur'],
  tags: ['info'],
  command: ['totalfitur'],
  run: async (m, { conn, args, command }) => {
    let totalf = Object.values(global.plugins).filter((v) => v.help && v.tags).length;
    conn.reply(m.chat, `Total Fitur saat ini: ${totalf}`, m);
  }
};

export default handler;
