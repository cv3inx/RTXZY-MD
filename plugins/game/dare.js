const handler = {
  help: ['dare'],
  tags: ['fun'],
  command: /^(dare|berani|tantangan)$/i,
  limit: true,
  run: async (m, { conn, Api }) => {
    let img = 'https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg';
    let dare = await Api.get('/api/random/dare').then((result) => result.json());
    conn.sendFile(m.chat, img, 'dare.png', `*DARE*\n\n“${dare.result}”`, m);
  }
};

export default handler;
