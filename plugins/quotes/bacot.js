let handler = async (m, { conn, Api }) => {
  let res = await Api.get('/api/random/bacot').then((result) => result.json());
  let anu = `
─────〔 *Bacot* 〕─────

${res.hasl}
`;
  conn.reply(m.chat, anu, m);
};
handler.help = ['bacot'];
handler.tags = ['quotes'];
handler.command = /^(bacot)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;

handler.admin = false;
handler.botAdmin = false;

handler.fail = null;

export default handler;
