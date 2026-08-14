const handler = {
  help: ['resetprefix'],
  tags: ['owner'],
  command: 'resetprefix',
  rowner: true,
  run: async (m, { conn }) => {
    global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
    await m.reply(`Prefix berhasil direset`);
  }
};

export default handler;
