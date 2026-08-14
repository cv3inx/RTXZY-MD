const handler = {
  help: ['setnamegc'],
  tags: ['group'],
  command: /^setnamegc$/i,
  owner: false,
  mods: false,
  premium: false,
  group: true,
  private: false,
  register: false,
  admin: true,
  botAdmin: true,
  run: async (m, { conn, args, usedPrefix, command }) => {
    if (!args.length) {
      return m.reply(`Mana nama grub nya? Contoh: *${usedPrefix + command}* grub himpunan ngawi`);
    }

    try {
      await conn.groupUpdateSubject(m.chat, args.join(' '));
      m.reply('Sukses mengubah nama grup!');
    } catch (err) {
      m.reply('Gagal mengubah nama grup. Pastikan bot memiliki izin Admin.');
      console.error(err);
    }
  }
};

export default handler;
