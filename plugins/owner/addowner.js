const handler = {
  help: ['addowner [@user]'],
  tags: ['owner'],
  command: /^(add|tambah|\+)owner$/i,
  owner: true,
  run: async (m, { conn, text }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
    else who = m.chat;
    if (!who) throw `tag orangnya!`;
    if (global.owner.includes(who.split`@`[0])) throw 'dia udah menjadi owner !';
    global.owner.push(`${who.split`@`[0]}`);
    conn.reply(m.chat, `@${who.split`@`[0]} sekarang owner !`, m, {
      contextInfo: {
        mentionedJid: [who]
      }
    });
  }
};

export default handler;
