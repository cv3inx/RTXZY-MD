const handler = {
  help: ['hapusgiveaway'],
  tags: ['group'],
  command: ['deletegiveaway', 'hapusgiveaway'],
  group: true,
  admin: true,
  run: async (m, { conn, participants, usedPrefix }) => {
    let id = m.chat;
    conn.giveway = conn.giveway ? conn.giveway : {};
    if (!(id in conn.giveway)) throw `_*Tidak ada GIVEAWAY berlangsung digrup ini!*_\n\n*${usedPrefix}mulaigiveaway* - untuk memulai giveaway`;
    delete conn.giveway[id];
    conn.sendMessage(m.chat, { text: '*GIVEAWAY* telah selesai', mentions: participants.map((a) => a.id) });
  }
};
export default handler;
