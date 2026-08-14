const handler = {
  help: ['truth'],
  tags: ['fun'],
  command: /^(truth|kebenaran|kejujuran)$/i,
  limit: true,
  run: async (m, { conn, Api }) => {
    let img = 'https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg';
    let truth = await Api.get('/api/random/truth').then((result) => result.json());
    conn.sendFile(m.chat, img, 'truth.png', `*TRUTH*\n\n“${truth.result}”`, m);
  }
};

export default handler;
