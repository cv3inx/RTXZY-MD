let handler = async (m, { conn, usedPrefix, command, Api }) => {
  try {
    let res = await Api.get('/api/muslim/niatshubuh');
    let json = await res.json();
    var sbh = [`―-NIAT SUBUH-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
    conn.reply(m.chat, `${sbh}`);
  } catch (e) {
    throw eror;
  }
};

handler.help = ['niatshubuh'];
handler.tags = ['islam'];
handler.command = /^(niatshubuh)$/i;
handler.group = false;
handler.limit = true;

export default handler;

//danaputra133
