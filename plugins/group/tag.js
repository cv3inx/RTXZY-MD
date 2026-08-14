const handler = {
  help: ['totag'],
  tags: ['group'],
  command: /^(totag|tag)$/i,
  admin: true,
  group: true,
  run: async (m, { conn, text, isAdmin, participants }) => {
    let users = participants.map((u) => u.id).filter((v) => v !== conn.user.jid);
    if (!m.quoted) throw `Reply pesan`;
    conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users });
  }
};

export default handler;
