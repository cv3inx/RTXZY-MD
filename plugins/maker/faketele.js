import uploadImage from '../../lib/media/uploadImage.js';
const handler = {
  help: ['faketele <bio|nama|ponsel|username>'],
  tags: ['maker'],
  command: 'faketele',
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    try {
      let q = m.quoted ? m.quoted : m;
      let mime = (q.msg || q).mimetype || '';

      let guide = `Kirim gambar (atau balas gambar) dengan caption:\n\n*${usedPrefix + command} bio|nama|ponsel|username*\n\n*Contoh:*\n${usedPrefix + command} Just a dev|Budi Santoso|+6281234567890|budisantoso`;

      if (!text) throw `*❌ Teks isian tidak boleh kosong!*\n\n${guide}`;
      if (!mime) throw `*❌ Media tidak ditemukan!*\n\n${guide}`;
      if (!/image\/(jpe?g|png)/.test(mime)) throw `_*Mime ${mime} tidak didukung!*_`;
      let [bio, nama, ponsel, username] = text.split('|');
      if (!bio || !nama || !ponsel || !username) {
        throw `*❌ Format salah atau ada data yang kurang!*\n\nPastikan memisahkan teks menggunakan tanda \`|\` tanpa terlewat.\n\n${guide}`;
      }

      await m.reply('⏳ _Sedang mengunggah gambar dan membuat Fake Telegram..._');

      let media = await q.download?.();
      if (!media) throw 'Gagal mengunduh gambar. Pastikan kamu membalas gambar.';

      let link = await uploadImage(media);
      if (!link) throw 'Gagal mengunggah gambar ke server.';

      let apiUrl = Api.url('/api/maker/canvas-fakeTele', { bio: bio.trim(), nama: nama.trim(), ponsel: ponsel.trim(), url: link, username: username.trim() });

      await conn.sendFile(m.chat, apiUrl, 'faketele.jpg', 'Done!', m);
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
