import * as zapo from '../../lib/simple.js';

const handler = {
  help: ['addlist'],
  usage: '<teks>',
  tags: ['store'],
  command: 'addlist',
  group: true,
  admin: true,
  run: async (m, { conn, text, command, usedPrefix }) => {
    const { proto } = zapo;

    let M = proto.WebMessageInfo;
    if (!m.quoted) throw `balas pesan dengan perintah *${usedPrefix + command}*`;
    if (!text) throw `penggunaan: ${usedPrefix + command} <teks>\n\ncontoh:\n${usedPrefix + command} tes`;
    let msgs = db.data.chats[m.chat].listStr;
    if (text in msgs) throw `'${text}' telah terdaftar di List store`;
    msgs[text.toLowerCase()] = M.fromObject(await m.getQuotedObj()).toJSON();
    m.reply(`berhasil menambahkan ${text.toLowerCase()} ke List Store.\n\nakses dengan mengetik namanya`.trim());
  }
};

export default handler;
