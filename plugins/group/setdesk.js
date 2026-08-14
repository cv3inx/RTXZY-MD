const handler = {
  help: ['setdeskgroup <text>'],
  tags: ['group'],
  command: /^set(desk|deskripsi|deskripsigc|deskripsigroup|deskripsigrup|deskgc)?$/i,
  owner: false,
  mods: false,
  premium: false,
  group: true,
  private: false,
  register: false,
  admin: true,
  botAdmin: true,
  run: async (m, { conn, command, usedPrefix, text }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} teks`;
    await conn.groupUpdateDescription(m.chat, text);
    m.reply('Sukses mengganti deskripsi group');
  }
};

export default handler;
