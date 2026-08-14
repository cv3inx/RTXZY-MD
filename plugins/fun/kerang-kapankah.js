const handler = {
  help: ['', 'kah'].map((v) => 'kapan' + v + ' <text>?'),
  tags: ['kerang'],
  customPrefix: /(\?$)/,
  command: ['kapan', 'kapankah'],
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, text }) => {
    conn.reply(
      m.chat,
      `Kayaknya ${Math.floor(Math.random() * 100)} ${pickRandom(['detik', 'menit', 'jam', 'hari', 'minggu', 'bulan', 'tahun', 'abad'])} lagi ...
`.trim(),
      m,
      m.mentionedJid
        ? {
            contextInfo: {
              mentionedJid: m.mentionedJid
            }
          }
        : {}
    );
  }
};

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
