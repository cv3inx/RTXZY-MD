const handler = {
  help: ['setdesk'],
  usage: 'group text',
  tags: ['group'],
  command: ['set', 'setdesk', 'setdeskripsi', 'setdeskripsigc', 'setdeskripsigroup', 'setdeskripsigrup', 'setdeskgc'],
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
