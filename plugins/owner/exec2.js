import cp from 'child_process';
import { promisify } from 'util';
let exec = promisify(cp.exec).bind(cp);
const handler = {
  help: ['$'],
  tags: ['advanced'],
  customPrefix: /^[$] /,
  command: new RegExp(),
  rowner: true,
  run: async (m, { conn, isOwner, command, text }) => {
    if (global.conn.user.jid != conn.user.jid) return;
    m.reply('Executing...');
    let o;
    try {
      o = await exec(command.trimStart() + ' ' + text.trimEnd());
    } catch (e) {
      o = e;
    } finally {
      let { stdout, stderr } = o;
      if (stdout.trim()) m.reply(stdout);
      if (stderr.trim()) m.reply(stderr);
    }
  }
};
export default handler;
