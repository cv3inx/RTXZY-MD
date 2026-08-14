import { buildPrefixRegex } from '../../lib/simple.js';

const handler = {
  help: ['setprefix'],
  usage: '[prefix]',
  tags: ['owner'],
  command: 'setprefix',
  rowner: true,
  run: async (m, { conn, text }) => {
    if (!text) throw `No Prefix detected...`;
    global.prefix = buildPrefixRegex(text || global.opts['prefix'] || global.config.prefix);
    await m.reply(`Prefix telah ditukar ke *${text}*`);
    // conn.fakeReply(m.chat, 'Prefix telah ditukar ke *${text}*', '0@s.whatsapp.net', 'Set Prefix Bot')
  }
};

export default handler;
