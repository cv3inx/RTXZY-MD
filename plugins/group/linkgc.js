const handler = {
  help: ['linkgroup'],
  tags: ['group'],
  command: /^link(g(c)?ro?up)?$/i,
  group: true,
  admin: true,
  run: async (m, { conn }) => {
    try {
      conn.reply(m.chat, `*Link Group:* ${await conn.getName(m.chat)}\n\nhttps://chat.whatsapp.com/` + (await conn.groupInviteCode(m.chat)) + `\n\n${conn.user.name}`, m);
    } catch {
      conn.reply(m.chat, `Jadikan @${conn.user.jid.split('@')[0]} sebagai admin untuk menggunakan perintah ini!`, m, { mentions: [conn.user.jid] });
    }
  }
};

export default handler;
