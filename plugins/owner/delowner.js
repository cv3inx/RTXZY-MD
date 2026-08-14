const handler = {
  help: ['delowner [@user]'],
  tags: ['owner'],
  command: /^(del|hapus|-)owner$/i,
  owner: true,
  run: async (m, { conn, text }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
    else who = m.chat;
    if (!who) throw `tag orangnya!`;
    if (!global.owner.includes(who.split`@`[0])) throw 'dia bukan owner !';
    let index = global.owner.indexOf(who.split`@`[0]);
    global.owner.splice(index, 1);
    conn.reply(m.chat, `@${who.split`@`[0]} sekarang bukan owner lagi !`, m, {
      contextInfo: {
        mentionedJid: [who]
      }
    });
  }
};
export default handler;
