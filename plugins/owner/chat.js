// Pengaturan per-chat: pin, arsip, mute, tandai baca, lock.
//
// Semuanya app-state mutation, jadi ikut tersinkron ke semua perangkat yang
// tertaut — dan hanya mengubah tampilan akun bot, bukan tampilan peer.
const HOURS = 3600 * 1000;
const DEFAULT_MUTE_HOURS = 8;
// Mute "selamanya" di WhatsApp tetap butuh timestamp, jadi dipakai tanggal jauh.
const FOREVER = 100 * 365 * 24 * HOURS;

const handler = {
  help: ['chat'],
  usage: 'pin/unpin/arsip/unarsip/mute/unmute/baca/belumbaca/lock/unlock',
  tags: ['owner'],
  command: ['chat', 'chatset'],
  owner: true,
  run: async (m, { conn, args, usedPrefix, command }) => {
    const chat = conn._client?.chat;
    if (!chat) throw 'Koneksi belum siap.';

    const action = (args[0] || '').toLowerCase();
    // JID chat lain boleh diselipkan di argumen mana pun setelah aksi, supaya
    // `mute 8 62xxx@s.whatsapp.net` dan `pin 62xxx@s.whatsapp.net` sama-sama
    // jalan. Tanpa JID, yang diubah adalah chat tempat perintah dikirim.
    const target = args.slice(1).find((arg) => arg.includes('@')) || m.chat;
    const nama = target === m.chat ? 'chat ini' : target.split('@')[0];

    switch (action) {
      case 'pin':
      case 'unpin':
        // Pin dan arsip saling mematikan di sisi server.
        await chat.setChatPin(target, action === 'pin');
        return m.reply(`${nama} ${action === 'pin' ? 'dipin' : 'dilepas dari pin'}.`);

      case 'arsip':
      case 'archive':
      case 'unarsip':
      case 'unarchive': {
        const on = action === 'arsip' || action === 'archive';
        await chat.setChatArchive(target, on);
        return m.reply(`${nama} ${on ? 'diarsipkan' : 'dikeluarkan dari arsip'}.`);
      }

      case 'mute': {
        const durasi = args.slice(1).find((arg) => !arg.includes('@')) || '';
        const forever = /^(selamanya|forever|permanen)$/i.test(durasi);
        const jam = durasi && !forever ? Number(durasi) : DEFAULT_MUTE_HOURS;
        if (!forever && (!Number.isFinite(jam) || jam <= 0)) throw `Durasi mute harus angka jam.\n\n*• Contoh:* ${usedPrefix + command} mute 8\n*• Selamanya:* ${usedPrefix + command} mute selamanya`;
        await chat.setChatMute(target, true, Date.now() + (forever ? FOREVER : jam * HOURS));
        return m.reply(`${nama} dimute ${forever ? 'selamanya' : `${jam} jam`}.`);
      }

      case 'unmute':
        await chat.setChatMute(target, false);
        return m.reply(`${nama} di-unmute.`);

      case 'baca':
      case 'read':
      case 'belumbaca':
      case 'unread': {
        const read = action === 'baca' || action === 'read';
        await chat.setChatRead(target, read);
        return m.reply(`${nama} ditandai ${read ? 'sudah dibaca' : 'belum dibaca'}.`);
      }

      case 'lock':
      case 'unlock':
        // Lock ikut menghapus status arsip dan pin.
        await chat.setChatLock(target, action === 'lock');
        return m.reply(`${nama} ${action === 'lock' ? 'dikunci' : 'dibuka kuncinya'}.`);

      default:
        return m.reply([`*• Pin:* ${usedPrefix + command} pin | unpin`, `*• Arsip:* ${usedPrefix + command} arsip | unarsip`, `*• Mute:* ${usedPrefix + command} mute 8 | mute selamanya | unmute`, `*• Tanda baca:* ${usedPrefix + command} baca | belumbaca`, `*• Lock:* ${usedPrefix + command} lock | unlock`, '', 'Tanpa JID, yang diubah adalah chat tempat perintah ini dikirim.', `Chat lain: ${usedPrefix + command} pin 628xxx@s.whatsapp.net`].join('\n'));
    }
  }
};

export default handler;
