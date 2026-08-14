let handler = async (m, { conn, command, Api }) => {
  try {
    let buffer = await Api.get(`/api/cecan/${command}`).then((res) => res.buffer());
    conn.sendFile(m.chat, buffer, 'hasil.jpg', `Random ${command}`, m);
  } catch (err) {
    throw eror;
  }
};

handler.help = handler.command = ['china', 'vietnam', 'thailand', 'indonesia', 'korea', 'japan', 'malaysia', 'justinaxie', 'jeni', 'jiso', 'ryujin', 'rose', 'hijaber'];
handler.tags = ['internet'];
handler.limit = true;
export default handler;
