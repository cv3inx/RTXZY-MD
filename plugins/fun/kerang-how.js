const handler = {
  help: ['howgay', 'howpintar', 'howcantik', 'howganteng', 'howgabut', 'howgila', 'howlesbi', 'howstress', 'howbucin', 'howjones', 'howsadboy'],
  usage: 'siapa?',
  tags: ['kerang'],
  command: ['howgay', 'howpintar', 'howcantik', 'howganteng', 'howgabut', 'howgila', 'howlesbi', 'howstres', 'howstress', 'howbucin', 'howjones', 'howsadboy'],
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, command, text }) => {
    if (!text) throw `Siapa Yang *${command.replace('how', '').toUpperCase()}*`;

    let who = m.mentionedJid?.[0];
    let displayText = text;

    if (who && who.endsWith('@s.whatsapp.net')) {
      let number = who.split('@')[0];
      displayText = `@${number}`;
    } else if (!who) {
      who = m.sender;
      displayText = text.trim() || 'kamu';
    }

    let mentions = who && who.endsWith('@s.whatsapp.net') ? [who] : [];

    let percent = Math.floor(Math.random() * 101);
    let result = `
${command} *${displayText}*
*${displayText}* is *${percent}%* ${command.replace('how', '').toUpperCase()}
  `.trim();

    conn.reply(m.chat, result, m, {
      contextInfo: {
        mentionedJid: mentions
      }
    });
  }
};

export default handler;
