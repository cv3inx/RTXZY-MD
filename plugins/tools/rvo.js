const handler = {
  help: ['readviewonce'],
  tags: ['tools'],
  command: ['readviewonce', 'read', 'rvo', 'liat', 'readvo'],
  premium: false,
  register: false,
  fail: null,
  run: async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    try {
      let media = await q.download?.();
      await conn.sendFile(m.chat, media, null, '', m);
    } catch (e) {
      m.reply('Media gagal dimuat!');
    }
  }
};

export default handler;
