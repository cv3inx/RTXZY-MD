import { createHash } from 'crypto';

const handler = {
  help: ['nomorseri'],
  tags: ['xp', 'rpg'],
  command: ['nomorseri'],
  group: true,
  rpg: true,
  run: async function (m, { text, usedPrefix }) {
    let sn = createHash('md5').update(m.sender).digest('hex');
    m.reply(
      `
Serial Number kamu: 
${sn}`.trim()
    );
  }
};

export default handler;
