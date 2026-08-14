const handler = {
  help: ['edit'],
  tags: ['tools'],
  command: 'edit',
  run: async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw 'masukkan teks';
    let q = m.quoted ? m.quoted : m;
    if (!q.id) throw 'reply pesan bot yang ingin diedit';
    if (!q.fromMe) throw 'itu bukan pesan dari bot';
    await conn.sendMessage(m.chat, { text: text, edit: q });
  }
};

export default handler;
