const handler = {
  help: ['setprefix'].map((v) => v + ' [prefix]'),
  tags: ['owner'],
  command: 'setprefix',
  rowner: true,
  run: async (m, { conn, text }) => {
    if (!text) throw `No Prefix detected...`;
    global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
    await m.reply(`Prefix telah ditukar ke *${text}*`);
    // conn.fakeReply(m.chat, 'Prefix telah ditukar ke *${text}*', '0@s.whatsapp.net', 'Set Prefix Bot')
  }
};

export default handler;
