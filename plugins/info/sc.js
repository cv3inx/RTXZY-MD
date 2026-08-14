const handler = {
  help: ['sc', 'sourcecode'],
  tags: ['info'],
  command: ['sc', 'sourcecode'],
  run: async (m, { conn }) => {
    let ye = `@${m.sender.split`@`[0]}`;
    let esce = `
Hai ${ye} Bot Ini Menggunakan Script :\n• https://github.com/BOTCAHX/RTXZY-MD
`;
    m.reply(esce);
  }
};

export default handler;
