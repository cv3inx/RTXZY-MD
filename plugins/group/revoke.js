const handler = {
  help: ['revoke'],
  tags: ['group'],
  command: 'revoke',
  group: true,
  botAdmin: true,
  run: async (m, { isAdmin, isOwner, conn, command }) => {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn);
      throw false;
    }
    conn.groupRevokeInvite(m.chat);
    conn.reply(m.chat, `Sukses ${command} link grup, link telah di kirim ke chat pribadi`, m);
    await delay(1000);
    let linknya = await conn.groupInviteCode(m.chat);
    conn.reply(m.sender, 'https://chat.whatsapp.com/' + linknya, m);
  }
};

// handler.admin = true

export default handler;

const delay = (time) => new Promise((res) => setTimeout(res, time));
