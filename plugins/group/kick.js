const handler = {
  help: ['kick'],
  usage: '@user',
  tags: ['group'],
  command: /^(kic?k|remove|tendang|\-)$/i,
  group: true,
  botAdmin: true,
  run: async (m, { conn, isOwner, isAdmin, args }) => {
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
      throw `tag yang mau dikick`;
    }

    users = users.filter((u) => !(u == ownerGroup || u.includes(conn.user.jid)));

    if (users.length === 0) return m.reply('Tidak ada user valid yang bisa dikick!');

    for (let user of users) {
      if (user.endsWith('@s.whatsapp.net')) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        } catch (e) {
          console.error(e);
          await m.reply(`Gagal kick @${user.split('@')[0]}!`, m.chat, {
            mentions: [user]
          });
        }
      }
    }
  }
};

export default handler;
