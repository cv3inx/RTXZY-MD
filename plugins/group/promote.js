const handler = {
  help: ['promote'],
  usage: '@user',
  tags: ['group', 'owner'],
  command: /^(promo?te|admin|\^)$/i,
  group: true,
  botAdmin: true,
  admin: true,
  fail: null,
  run: async (m, { conn, isOwner, isAdmin, args, command }) => {
    if (m.isZapo) return;

    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      throw false;
    }

    let ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
    let users = [];

    if (m.quoted) {
      if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid) return;
      users = [m.quoted.sender];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      users = m.mentionedJid;
    } else {
      throw 'Tag siapa yang ingin dinaikkan jabatannya?';
    }

    users = users.filter((u) => !(u == ownerGroup || u.includes(conn.user.jid)));

    if (users.length === 0) return m.reply('Tidak ada user valid yang bisa dipromote!');

    for (let user of users) {
      if (user.endsWith('@s.whatsapp.net')) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
          await m.reply(`Sukses ${command} @${user.split('@')[0]}!`, m.chat, {
            mentions: [user]
          });
        } catch (e) {
          console.error(e);
          await m.reply(`Gagal ${command} @${user.split('@')[0]}!`, m.chat, {
            mentions: [user]
          });
        }
      }
    }
  }
};

export default handler;
