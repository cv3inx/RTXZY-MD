let handler = async (m, { conn, Api }) => {
  try {
    let res = await Api.get('/api/random/motivasi');
    let json = await res.json();
    conn.reply(m.chat, `―MOTIVASI―\n\n"${json.result}"`);
  } catch (e) {
    throw `Internal server eror!`;
  }
};
handler.help = ['motivasi'];
handler.tags = ['quotes'];
handler.command = /^(motivasi)$/i;

export default handler;
