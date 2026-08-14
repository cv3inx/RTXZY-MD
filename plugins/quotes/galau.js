let handler = async (m, { conn, Api }) => {
  const res = await Api.get('/api/random/katasenja').then((result) => result.json());
  let anu = `─────〔 *Galau* 〕─────

${res.senja}
`;
  m.reply(anu);
};
handler.help = ['galau'];
handler.tags = ['quotes'];
handler.command = /^(galau)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;
handler.register = false;

handler.admin = false;
handler.botAdmin = false;

handler.fail = null;

export default handler;
