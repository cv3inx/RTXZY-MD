const handler = {
  help: ['guildleave'],
  tags: ['rpgG'],
  command: 'guildleave',
  rpg: true,
  run: async (m, { conn }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild.', m);

    let guildId = user.guild;
    let guild = global.db.data.guilds[guildId];
    if (!guild) return conn.reply(m.chat, 'Guild tidak ditemukan.', m);

    guild.members = guild.members.filter((member) => member !== userId);
    user.guild = null;

    conn.reply(m.chat, 'Kamu telah keluar dari guild.', m);
  }
};

export default handler;
