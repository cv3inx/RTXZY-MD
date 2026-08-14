const handler = {
  help: ['setwelcome <teks>'],
  tags: ['owner', 'group'],
  command: /^setwelcome$/i,
  botAdmin: true,
  run: async (m, { conn, text, isROwner, isOwner }) => {
    if (text) {
      if (isROwner) global.conn.welcome = text;
      else if (isOwner) conn.welcome = text;
      global.db.data.chats[m.chat].sWelcome = text;
      m.reply('Welcome berhasil diatur\n@user (Mention)\n@subject (Judul Grup)\n@desc (Deskripsi Grup)');
    } else throw 'Teksnya mana?';
  }
};

export default handler;
