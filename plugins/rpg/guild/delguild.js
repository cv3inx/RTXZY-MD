const handler = {
  help: ['delguild'],
  usage: 'nomor_guild',
  tags: ['rpgG'],
  command: 'delguild',
  owner: false,
  rpg: true,
  run: async (m, { conn, args }) => {
    let userId = m.sender;
    let user = global.db.data.users[userId];

    if (!user.guild) return conn.reply(m.chat, 'Kamu belum tergabung dalam guild mana pun.', m);

    let guilds = Object.values(global.db.data.guilds);

    if (guilds.length === 0) return conn.reply(m.chat, 'Tidak ada guild yang tersedia untuk dihapus.', m);

    let guildList = guilds.map((guild, index) => `${index + 1}. ${guild.name}`).join('\n');
    let responseText = `Pilih guild yang ingin dihapus dengan mengetik nomor guild:\n\n${guildList}`;

    if (args.length < 1) return conn.reply(m.chat, responseText, m);

    let guildIndex = parseInt(args[0]) - 1;

    if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= guilds.length) {
      return conn.reply(m.chat, 'Nomor guild tidak valid.', m);
    }

    let selectedGuild = guilds[guildIndex];

    if (selectedGuild.owner !== userId) return conn.reply(m.chat, 'Hanya owner guild yang bisa menghapus guild.', m);

    // Hapus guild dari database
    delete global.db.data.guilds[selectedGuild.name];

    // Hapus referensi guild dari setiap anggota
    selectedGuild.members.forEach((memberId) => {
      if (global.db.data.users[memberId]) {
        global.db.data.users[memberId].guild = null;
      }
    });

    conn.reply(m.chat, `Guild ${selectedGuild.name} berhasil dihapus.`, m);
  }
};

export default handler;
