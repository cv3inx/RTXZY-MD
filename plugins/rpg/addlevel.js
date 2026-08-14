import * as zapo from '../../lib/simple.js';

const handler = {
  help: ['addlevel'],
  usage: '@user <jumlah level>',
  tags: ['rpg'],
  command: 'addlevel',
  owner: true,
  rpg: true,
  run: async (m, { conn, text }) => {
    const { MessageType } = zapo;

    if (!text) {
      throw 'Masukkan jumlah level yang ingin ditambahkan pada pengguna. Contoh: .addlevel @user 10';
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '🕒',
        key: m.key
      }
    });

    let mentionedJid = m.mentionedJid[0];
    if (!mentionedJid) {
      throw 'Tag pengguna yang ingin ditambahkan levelnya. Contoh: .addlevel @user 10';
    }

    let levelToAdd = parseInt(text.split(' ')[1]);
    if (isNaN(levelToAdd)) {
      throw 'Jumlah level yang dimasukkan harus berupa angka. Contoh: .addlevel @user 10';
    }

    let users = global.db.data.users;
    if (!users[mentionedJid]) {
      users[mentionedJid] = {
        level: 0,
        exp: 0,
        lastclaim: 0
      };
    }

    users[mentionedJid].level += levelToAdd;

    await conn.reply(m.chat, `Berhasil menambahkan ${levelToAdd} level untuk @${mentionedJid.split('@')[0]}.`, m, {
      mentions: [mentionedJid]
    });
  }
};

export default handler;
