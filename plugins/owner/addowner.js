const handler = {
  help: ['addowner'],
  usage: '[@user]',
  tags: ['owner'],
  command: /^(add|tambah|\+)owner$/i,
  owner: true,
  run: async (m, { conn, text }) => {
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
    else who = m.chat;
    if (!who) throw `tag orangnya!`;
    if (global.config.access.owner.includes(who.split`@`[0])) throw 'dia udah menjadi owner !';
    global.config.access.owner.push(`${who.split`@`[0]}`);
    conn.reply(m.chat, `@${who.split`@`[0]} sekarang owner !`, m, {
      contextInfo: {
        mentionedJid: [who]
      }
    });
  }
};

export default handler;
