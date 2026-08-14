const handler = {
  command: ['out', 'leavegc'],
  help: ['out', 'leavegc'],
  tags: ['group'],
  owner: true,
  run: async (m, { conn, args, command }) => {
    let group = m.chat;
    await m.reply('Bot akan keluar dari group', m.chat);
    await sleep(1000);
    await conn.groupLeave(group);
  }
};

export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
