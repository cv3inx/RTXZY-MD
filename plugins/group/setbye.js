const handler = {
  help: ['setbye <teks>'],
  tags: ['owner', 'group'],
  command: /^setbye$/i,
  botAdmin: true,
  run: async (m, { conn, text, isROwner, isOwner }) => {
    if (text) {
      if (isROwner) global.conn.bye = text;
      else if (isOwner) conn.bye = text;
      global.db.data.chats[m.chat].sBye = text;
      m.reply('Bye berhasil diatur\n@user (Mention)');
    } else throw 'Teksnya mana?';
  }
};

export default handler;
