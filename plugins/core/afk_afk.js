const handler = {
  help: ['afk [alasan]'],
  tags: ['main'],
  command: /^afk$/i,
  run: async (m, { text }) => {
    let user = global.db.data.users[m.sender];
    user.afk = +new Date();
    user.afkReason = text;
    m.reply(`@${m.sender.split`@`[0]} sekarang AFK ${text ? '\nDengan Alasan : ' + text : 'Tanpa Alasan'}
`);
  }
};

export default handler;
//@${who.split`@`[0]}        /////@${m.sender.split`@`[0]
