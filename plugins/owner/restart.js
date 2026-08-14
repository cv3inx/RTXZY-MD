import { spawn } from 'child_process';
const handler = {
  help: ['restart'],
  tags: ['owner'],
  command: ['srvrestart', 'restart'],
  rowner: true,
  run: async (m, { conn, isROwner, text }) => {
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js';
    if (global.conn.user.jid == conn.user.jid) {
      await m.reply('Sedang Merestart Bot...\nMohon tunggu sekitar 1 menit');
      process.send('reset');
    } else throw '_eeeeeiiittsssss..._';
  }
};

export default handler;
