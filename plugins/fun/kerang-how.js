const handler = {
  help: ['gay', 'pintar', 'cantik', 'ganteng', 'gabut', 'gila', 'lesbi', 'stress', 'bucin', 'jones', 'sadboy'].map((v) => 'how' + v + ' siapa?'),
  tags: ['kerang'],
  command: /^how(gay|pintar|cantik|ganteng|gabut|gila|lesbi|stress?|bucin|jones|sadboy)/i,
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
