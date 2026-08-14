const handler = {
  help: ['broadcast', 'bc'].map((v) => v + ' <teks>'),
  tags: ['owner'],
  command: /^(broadcast|bc)$/i,
  owner: true,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, text }) => {
    let chats = Object.keys(await conn.chats);
    conn.reply(m.chat, `_Mengirim pesan broadcast ke ${chats.length} chat_`, m);
    for (let id of chats) {
      await sleep(3000);

      conn.sendMessage(id, { image: { url: 'https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg' }, caption: text.trim(), mentions: [m.sender] }, { quoted: m });
    }
    m.reply('Broadcast selesai');
  }
};

export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
