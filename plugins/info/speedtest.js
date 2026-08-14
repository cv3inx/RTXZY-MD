import cp from 'child_process';
import { promisify } from 'util';
let exec = promisify(cp.exec).bind(cp);
const handler = {
  help: ['speedtest'],
  tags: ['info'],
  command: /^(speedtest|ookla)$/i,
  premium: false,
  run: async (m, { conn }) => {
    await conn.reply(m.chat, `Please Wait`, m);
    let o;
    try {
      o = await exec('python3 speed.py --share --secure');
    } catch (e) {
      o = e;
    } finally {
      let { stdout, stderr } = o;
      if (stdout.trim()) conn.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg' }, caption: stdout, mentions: [m.sender] }, { quoted: m });

      if (stderr.trim()) m.reply(stderr);
    }
  }
};
export default handler;
