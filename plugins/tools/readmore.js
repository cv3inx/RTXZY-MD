const handler = {
  help: ['readmore'],
  usage: 'teks|teks',
  tags: ['tools'],
  command: ['spoiler', 'hidetext', 'readmore', 'selengkapnya'],
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, text }) => {
    let [l, r] = text.split`|`;
    if (!l) l = '';
    if (!r) r = '';
    conn.reply(m.chat, l + readMore + r, m);
  }
};

export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
