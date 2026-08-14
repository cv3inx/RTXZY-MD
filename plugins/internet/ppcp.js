let handler = async (m, { conn, command, Api }) => {
  let res = await Api.get('/api/randomgambar/couplepp');
  if (res.status != 200) throw await res.text();
  let json = await res.json();
  if (!json.status) throw json;
  conn.sendFile(m.chat, json.result.female, 'pp.jpg', 'PP Cewenya', m);
  conn.sendFile(m.chat, json.result.male, 'pria.jpg', 'PP Cowonya', m);
};
handler.help = ['ppcp'];
handler.tags = ['internet'];
handler.command = /^ppcp$/i;

export default handler;
