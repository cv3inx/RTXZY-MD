import { buildPrefixRegex } from '../../lib/simple.js';

const handler = {
  help: ['resetprefix'],
  tags: ['owner'],
  command: 'resetprefix',
  rowner: true,
  run: async (m, { conn }) => {
    global.prefix = buildPrefixRegex(global.opts['prefix'] || global.config.prefix);
    await m.reply(`Prefix berhasil direset`);
  }
};

export default handler;
