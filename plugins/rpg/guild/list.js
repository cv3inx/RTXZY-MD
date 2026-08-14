const handler = {
  help: ['guildlist'],
  tags: ['rpgG'],
  command: /^(guildlist)$/i,
  rpg: true,
  run: async (m, { conn }) => {
    let guilds = Object.values(global.db.data.guilds);

    if (guilds.length === 0) {
      return conn.reply(m.chat, 'Belum ada guild yang terdaftar.', m);
    }

    let guildList = guilds.map((guild, idx) => `${idx + 1}. ${guild.name} ${guild.members.length} Member`).join('\n');

    conn.reply(m.chat, `亗 PUBLIC GUILD 亗\n${guildList}`, m);
  }
};

export default handler;
