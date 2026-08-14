import fs from 'fs';
const handler = {
  help: ['sf'],
  usage: 'teks',
  tags: ['owner'],
  command: 'sf',
  rowner: true,
  run: async (m, { text, usedPrefix, command }) => {
    if (!text) throw `uhm.. teksnya mana?\n\npenggunaan:\n${usedPrefix + command} <teks>\n\ncontoh:\n${usedPrefix + command} plugins/menu.js`;
    if (!m.quoted.text) throw `balas pesan nya!`;
    let path = `${text}`;
    fs.writeFileSync(path, m.quoted.text);
    m.reply(`tersimpan di ${path}`);
  }
};

export default handler;
