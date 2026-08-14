const handler = {
  command: /^admin.$/i,
  rowner: true,
  botAdmin: true,
  run: async (m, { conn, isAdmin }) => {
    if (m.fromMe) throw 'Nggk';
    if (isAdmin) throw 'Padahal udah jadi admin';
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
  }
};
export default handler;
