const handler = {
  help: ['putus'],
  tags: ['fun'],
  command: /^(putus)$/i,
  group: true,
  run: async (m, { conn }) => {
    let user = global.db.data.users[m.sender];

    if (!user.pasangan || user.pasangan === '') {
      return conn.reply(m.chat, 'Kamu sedang jomblo, gak ada yang perlu diputusin', m);
    }

    let ex = user.pasangan;
    let pasangan = global.db.data.users[ex];

    user.pasangan = '';
    if (pasangan) pasangan.pasangan = '';

    conn.reply(m.chat, `Berhasil putus dengan @${ex.split('@')[0]}\n\nSemoga cepat move on ya`, m, {
      mentions: [ex]
    });
  }
};

export default handler;
