import sharp from 'sharp';

// Plugin uji coba: cari tahu bentuk link preview mana yang benar-benar DIRENDER
// WhatsApp. Payload keempatnya sudah dipastikan benar di sisi library, jadi yang
// diuji di sini murni perilaku klien. Hapus file ini setelah ketemu jawabannya.
const handler = {
  help: ['testpreview'],
  tags: ['owner'],
  command: ['testpreview'],
  owner: true,
  run: async (m, { conn }) => {
    const link = global.config.links.instagram || global.config.links.group;
    if (!link) throw 'config.links.instagram / links.group kosong, tidak ada URL untuk diuji';

    const { data } = await conn.getFile(global.config.branding.thumb);
    const bytes = await sharp(data).resize({ width: 640, withoutEnlargement: true }).jpeg({ quality: 70 }).toBuffer();
    const { width, height } = await sharp(bytes).metadata();
    const thumbnail = { bytes, width, height };

    const cases = [
      ['1 auto-fetch', { text: `1. auto-fetch, zapo ambil sendiri\n${link}`, linkPreview: true }],
      ['2 override + link di teks', { text: `2. override, link ADA di teks\n${link}`, linkPreview: { title: 'Override', description: 'thumbnail dari kita', thumbnail } }],
      ['3 override tanpa link di teks', { text: '3. override, link TIDAK ada di teks', linkPreview: { title: 'Override', description: 'matchedText saja', matchedText: link, thumbnail } }],
      // Raw proto: lewat builder zapo sepenuhnya, jpegThumbnail diisi langsung.
      // Jalur ini tidak butuh perbaikan di simple.js, jadi ia juga jadi penanda
      // apakah prosesnya kebetulan versi lama.
      ['4 raw extendedTextMessage', { extendedTextMessage: { text: '4. raw proto, jpegThumbnail langsung', matchedText: link, title: 'Raw', description: 'tanpa lapisan linkPreview', previewType: 0, jpegThumbnail: bytes, thumbnailWidth: width, thumbnailHeight: height } }]
    ];

    for (const [label, content] of cases) {
      try {
        await conn.sendMessage(m.chat, content, { quoted: m });
      } catch (e) {
        await m.reply(`${label} gagal terkirim: ${e?.message || e}`);
      }
    }

    await m.reply(`Thumbnail: ${(bytes.length / 1024).toFixed(1)} KB · ${width}x${height}\nBalas: nomor berapa saja yang thumbnail-nya muncul?`);
  }
};

export default handler;
