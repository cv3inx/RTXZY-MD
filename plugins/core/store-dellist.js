const handler = {
  help: ['list'].map((v) => 'del' + v + ' <teks>'),
  tags: ['store'],
  command: 'dellist',
  admin: true,
  group: true,
  run: async (m, { text, usedPrefix, command }) => {
    if (!text) throw `gunakan *${usedPrefix}liststore* untuk melihat daftar pesan yg tersimpan.`;
    let msgs = db.data.chats[m.chat].listStr;
    if (!(text.toLowerCase() in msgs)) throw `'${text}' tidak terdaftar di daftar pesan.`;
    delete msgs[text.toLowerCase()];
    m.reply(`\n  [💬] berhasil menghapus pesan di daftar List dengan nama '${text.toLowerCase()}'.\n`);
  }
};

export default handler;
