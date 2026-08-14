let handler = async (m, { conn, usedPrefix, command, Api }) => {
  try {
    let res = await Api.get('/api/muslim/niatashar');
    let json = await res.json();
    var asr = [`―-NIAT ASHAR-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
    conn.reply(m.chat, `${asr}`);
  } catch (e) {
    throw eror;
  }
};

handler.help = ['niatashar'];
handler.tags = ['islam'];
handler.command = /^(niatashar)$/i;
handler.group = false;
handler.limit = true;

export default handler;

//danaputra133
