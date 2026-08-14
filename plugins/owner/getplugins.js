const __dirname = import.meta.dirname;
import fs from 'fs';
import path from 'path';
const handler = {
  help: ['getplugin'].map((v) => v + ' [filename]'),
  tags: ['owner'],
  command: /^(getplugin|get ?plugin|gp)$/i,
  rowner: true,
  run: async (m, { usedPrefix, command, text }) => {
    if (!text) throw `where is the text?\n\nexempel: ${usedPrefix + command} menu`;
    const filename = path.join(__dirname, `./${text}${!/\.js$/i.test(text) ? '.js' : ''}`);
    const listPlugins = fs.readdirSync(path.join(__dirname)).map((v) => v.replace(/\.js/, ''));
    if (!fs.existsSync(filename))
      return m.reply(
        `
'${filename}' not found!
${listPlugins
  .map((v) => v)
  .join('\n')
  .trim()}
`.trim()
      );
    m.reply(fs.readFileSync(filename, 'utf8'));
  }
};

export default handler;
