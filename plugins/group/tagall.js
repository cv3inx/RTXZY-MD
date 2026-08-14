const handler = {
  help: ['tagall'],
  usage: 'pesan',
  tags: ['group'],
  command: 'tagall',
  group: true,
  admin: true,
  run: async (m, { conn, text, participants }) => {
    let teks = `⋙ *PESAN DARI ADMIN GROUP* ⋘
\n *${text ? text : 'Nothing'}*\n\n`;
    for (let mem of participants) {
      teks += ` @${mem.id.split('@')[0]}\n`;
    }
    teks += `___________________________________________`;
    conn.sendMessage(m.chat, { text: teks, mentions: participants.map((a) => a.id) });
  }
};

export default handler;
