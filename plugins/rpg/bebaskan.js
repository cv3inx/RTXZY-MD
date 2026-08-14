const handler = {
  help: ['bebaskan'],
  tags: ['rpg'],
  command: /^bebaskan$/i,
  owner: false,
  admin: false,
  rpg: true,
  run: async (m, { conn, text }) => {
    if (!text) throw '• *Contoh :* .bebaskan 62×××';
    let who;
    if (m.isGroup) who = m.mentionedJid[0];
    else who = m.chat;
    if (!who) throw 'Tag orang yang ingin dibebaskan dari penjara';

    let users = global.db.data.users;

    // Mengecek pekerjaan pengguna yang meminta untuk membebaskan
    if (users[m.sender].job !== 'polisi') throw 'Anda harus menjadi polisi untuk melakukan tindakan ini.';

    users[who].jail = false;
    conn.sendMessage(m.chat, { react: { text: '☑️', key: m.key } });
  }
};

export default handler;
