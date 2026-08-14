import uploadImage from '../../lib/media/uploadImage.js';
const handler = {
  help: ['fakeml'],
  usage: '<username|rank|border>',
  tags: ['maker'],
  command: 'fakeml',
  limit: true,
  group: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!text && !mime) {
      throw `Kirim gambar (atau balas gambar) dengan caption:\n\n*${usedPrefix + command} username|rank|border*\n\n*Pilihan Rank:*\n- gm\n- epic\n- legend\n- mawi\n- honor\n- glory\n- imo\n\n*Pilihan Border:*\nAngka 1 sampai 16\n\n*Contoh:*\n${usedPrefix + command} MitoExe|gm|1`;
    }
    if (!text) {
      throw `Teks tidak boleh kosong!\n\nContoh: ${usedPrefix + command} MitoExe|gm|1`;
    }
    if (!mime) {
      throw `Media tidak ditemukan!\n\nKirim atau balas gambar dengan caption ${usedPrefix + command} username|rank|border`;
    }
    if (!/image\/(jpe?g|png)/.test(mime)) {
      throw `Mime ${mime} tidak didukung!`;
    }

    let [username, rank, border] = text.split('|');

    if (!username || !rank || !border) {
      throw `Format salah!\n\nGunakan format: ${usedPrefix + command} username|rank|border\nContoh: ${usedPrefix + command} MitoExe|gm|1`;
    }

    let validRanks = ['gm', 'epic', 'legend', 'mawi', 'honor', 'glory', 'imo'];
    if (!validRanks.includes(rank.trim().toLowerCase())) {
      throw `Rank tidak valid!\n\nPilihan rank: ${validRanks.join(', ')}`;
    }

    let borderNum = parseInt(border.trim());
    if (isNaN(borderNum) || borderNum < 1 || borderNum > 16) {
      throw `Border tidak valid!\n\nMasukkan angka 1 sampai 16.`;
    }

    await m.reply('⏳ _Sedang memproses gambar..._');

    let media = await q.download?.();
    if (!media) throw 'Gagal mengunduh gambar.';

    let link = await uploadImage(media);
    if (!link) throw 'Gagal mengunggah gambar ke server.';

    let apiUrl = Api.url('/api/maker/canvas-fakeMl', { username: username.trim(), border: borderNum, rank: rank.trim().toLowerCase(), avatar: link });

    await conn.sendFile(m.chat, apiUrl, 'fakeml.jpg', 'Done!', m);
  }
};

export default handler;
