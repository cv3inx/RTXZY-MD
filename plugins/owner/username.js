// Username WhatsApp milik bot. setUsername() sengaja tidak melempar error
// kalau gagal — ia mengembalikan false untuk "sudah dipakai", "format salah",
// dan "rate limited" tanpa membedakannya. Jadi saat gagal, alasannya dicari
// lewat checkUsernameAvailability() supaya pesannya berguna.
const USERNAME_RE = /^[a-z0-9._]{3,30}$/;

const describeState = (state) => {
  if (!state) return '';
  return ` (state: ${state})`;
};

const handler = {
  help: ['username'],
  usage: 'cek/set/hapus/pin',
  tags: ['owner'],
  command: ['username'],
  owner: true,
  run: async (m, { conn, args, usedPrefix, command }) => {
    const profile = conn._client?.profile;
    if (!profile) throw 'Koneksi belum siap.';

    const action = (args[0] || '').toLowerCase();
    const value = (args[1] || '').trim();
    const bantuan = [`*• Cek username bot:* ${usedPrefix + command} cek`, `*• Cek ketersediaan:* ${usedPrefix + command} cek namabaru`, `*• Pasang:* ${usedPrefix + command} set namabaru`, `*• Hapus:* ${usedPrefix + command} hapus`, `*• Set PIN recovery:* ${usedPrefix + command} pin 123456`].join('\n');

    if (action === 'cek' && !value) {
      const own = await profile.getOwnUsername();
      if (!own?.username) return m.reply(`Bot belum punya username.\n\nPasang dengan *${usedPrefix + command} set namakamu*`);
      return m.reply([`*Username:* @${own.username}${describeState(own.state)}`, `*PIN recovery:* ${own.pin ? 'sudah diset' : 'belum diset'}`].join('\n'));
    }

    if (action === 'cek') {
      if (!USERNAME_RE.test(value)) throw 'Username hanya boleh huruf kecil, angka, titik, dan underscore, panjang 3-30 karakter.';
      const result = await profile.checkUsernameAvailability(value);
      if (result?.available) return m.reply(`@${value} tersedia. Pasang dengan *${usedPrefix + command} set ${value}*`);
      const saran = result?.suggestions?.length ? `\n\n*Saran:*\n${result.suggestions.map((s) => `• @${s}`).join('\n')}` : '';
      return m.reply(`@${value} tidak tersedia.${saran}`);
    }

    if (action === 'set') {
      if (!value) throw `*• Contoh:* ${usedPrefix + command} set namakamu`;
      if (!USERNAME_RE.test(value)) throw 'Username hanya boleh huruf kecil, angka, titik, dan underscore, panjang 3-30 karakter.';

      const ok = await profile.setUsername({ username: value, source: 'USER_INPUT' });
      if (ok) return m.reply(`Username bot sekarang @${value}`);

      // Gagal tanpa alasan — cari tahu kenapa supaya pesannya tidak buta.
      const check = await profile.checkUsernameAvailability(value).catch(() => null);
      if (check && !check.available) {
        const saran = check.suggestions?.length ? `\n\n*Saran:*\n${check.suggestions.map((s) => `• @${s}`).join('\n')}` : '';
        return m.reply(`Gagal: @${value} sudah dipakai.${saran}`);
      }
      return m.reply(`Gagal memasang @${value}. Username terlihat tersedia, jadi kemungkinan besar kena rate limit — coba lagi beberapa menit lagi.`);
    }

    if (action === 'hapus') {
      const ok = await profile.deleteUsername();
      return m.reply(ok ? 'Username bot dihapus.' : 'Gagal menghapus username.');
    }

    if (action === 'pin') {
      if (!/^\d{6}$/.test(value)) throw `PIN recovery harus 6 digit angka.\n\n*• Contoh:* ${usedPrefix + command} pin 123456`;
      const ok = await profile.setUsernameKey(value);
      return m.reply(ok ? 'PIN recovery username diset.' : 'Gagal menyetel PIN recovery.');
    }

    return m.reply(bantuan);
  }
};

export default handler;
