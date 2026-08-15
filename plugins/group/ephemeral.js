// Pesan sementara (disappearing messages) untuk grup.
//
// conn.groupToggleEphemeral sudah lama ada di lib/simple.js tapi belum ada
// perintah yang memakainya. WhatsApp hanya menerima tiga durasi ini; nilai lain
// ditolak server, jadi divalidasi di sini supaya pesan errornya jelas.
const DURASI = { off: 0, '24jam': 86400, '7hari': 604800, '90hari': 7776000 };

const handler = {
  help: ['pesansementara'],
  usage: 'off/24jam/7hari/90hari',
  tags: ['group'],
  command: ['pesansementara', 'ephemeral', 'disappearing'],
  group: true,
  admin: true,
  botAdmin: true,
  run: async (m, { conn, args, usedPrefix, command }) => {
    const pilihan = (args[0] || '').toLowerCase();
    if (!(pilihan in DURASI)) throw [`*• Pilihan:* ${Object.keys(DURASI).join(' | ')}`, `*• Contoh:* ${usedPrefix + command} 7hari`, '', 'Setelah aktif, pesan baru di grup ini terhapus otomatis setelah durasi itu.'].join('\n');

    await conn.groupToggleEphemeral(m.chat, DURASI[pilihan]);
    return m.reply(pilihan === 'off' ? 'Pesan sementara dimatikan.' : `Pesan sementara aktif: pesan baru terhapus setelah *${pilihan}*.`);
  }
};

export default handler;
