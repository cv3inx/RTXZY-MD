const handler = {
  help: ['guildwarpause'],
  tags: ['rpgG'],
  command: /^(guildwarpause)$/i,
  rpg: true,
  run: async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (guild.owner !== userId) return conn.reply(m.chat, 'Hanya pemilik guild yang bisa menghentikan perang.', m);

    // Logika untuk menghentikan perang dapat ditambahkan di sini

    conn.reply(m.chat, 'Pertempuran dengan guild lawan sedang dihentikan.', m);
  }
};

export default handler;
