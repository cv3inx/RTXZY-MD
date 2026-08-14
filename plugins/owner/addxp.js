import * as zapo from '../../lib/simple.js';

const handler = {
  help: ['addxp'],
  usage: '@user jumlah xp',
  tags: ['xp'],
  command: 'addxp',
  owner: true,
  run: async (m, { conn, text }) => {
    const { MessageType } = zapo;

    if (!text) {
      throw 'Masukkan jumlah xp yang ingin ditambahkan pada pengguna. Contoh: .addxp @user 10';
    }

    conn.chatRead(m.chat);
    conn.sendMessage(m.chat, {
      react: {
        text: '🕒',
        key: m.key
      }
    });

    let mentionedJid = m.mentionedJid[0];
    if (!mentionedJid) {
      throw 'Tag pengguna yang ingin ditambahkan xpnya Contoh: .addxp @user 10';
    }

    let pointsToAdd = parseInt(text.split(' ')[1]);
    if (isNaN(pointsToAdd)) {
      throw 'Jumlah xp yang dimasukkan harus berupa angka. Contoh: .addxp @user 10';
    }

    let users = global.db.data.users;
    if (!users[mentionedJid]) {
      users[mentionedJid] = {
        exp: 0,
        lastclaim: 0
      };
    }

    users[mentionedJid].exp += pointsToAdd;

    conn.reply(m.chat, `Berhasil menambahkan ${pointsToAdd}exp untuk @${mentionedJid.split('@')[0]}.`, m, {
      mentions: [mentionedJid]
    });
  }
};

export default handler;
