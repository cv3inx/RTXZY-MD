// Nama tampilan bot (pushName) — yang dilihat peer di daftar chat mereka.
// Berbeda dari username: pushName bebas, tidak unik, dan tidak perlu diklaim.
const handler = {
  help: ['setbotname'],
  usage: 'nama baru',
  tags: ['owner'],
  command: ['setbotname', 'setnamebot'],
  owner: true,
  run: async (m, { conn, text, usedPrefix, command }) => {
    const profile = conn._client?.profile;
    if (!profile) throw 'Koneksi belum siap.';

    const name = (text || '').trim();
    if (!name) {
      const sekarang = conn.user?.name || '(belum diset)';
      throw [`*Nama bot sekarang:* ${sekarang}`, '', `*• Ganti:* ${usedPrefix + command} Nama Baru`, `*• Reset ke default perangkat:* ${usedPrefix + command} -`].join('\n');
    }
    if (name.length > 25) throw 'Nama terlalu panjang, maksimal 25 karakter.';

    // String kosong mereset ke nama default perangkat.
    await profile.setPushName(name === '-' ? '' : name);
    return m.reply(name === '-' ? 'Nama bot direset ke default perangkat.' : `Nama bot sekarang: ${name}\n\nPeer melihat perubahan ini pada pesan keluar berikutnya.`);
  }
};

export default handler;
