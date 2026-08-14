const handler = {
  help: ['guilddecline'],
  tags: ['rpgG'],
  command: /^(guilddecline)$/i,
  rpg: true,
  run: async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    if (guild.owner === userId) return conn.reply(m.chat, 'Pemilik guild tidak bisa menolak permintaan.', m);

    guild.waitingRoom = guild.waitingRoom.filter((room) => room !== userId);

    conn.reply(m.chat, 'Permintaan kamu untuk bergabung dengan guild telah ditolak.', m);
  }
};

export default handler;
