// Pengaturan privasi akun bot (last seen, foto profil, siapa boleh menambahkan
// ke grup, dll). Daftar setting dan nilai yang sah dibaca dari
// WA_PRIVACY_SETTING_VALUES milik zapo-js, bukan ditulis ulang di sini — tiap
// setting hanya menerima nilai yang WhatsApp Web sendiri terima.
import { WA_PRIVACY_SETTING_VALUES, WA_PRIVACY_DISALLOWED_LIST_CATEGORIES, WA_PRIVACY_CATEGORY_TO_SETTING } from 'zapo-js';

const SETTINGS = Object.keys(WA_PRIVACY_SETTING_VALUES);
// Hanya sebagian setting punya deny-list ("semua kecuali..."). Konstanta itu
// berisi nama kategori protokol, sementara API-nya memakai nama setting.
const DENY_ABLE = Object.values(WA_PRIVACY_DISALLOWED_LIST_CATEGORIES).map((category) => WA_PRIVACY_CATEGORY_TO_SETTING[category]);

/** Cocokkan input pengguna ke nama setting resmi, tanpa peduli huruf besar/kecil. */
const matchSetting = (input) => SETTINGS.find((s) => s.toLowerCase() === String(input).toLowerCase());

const handler = {
  help: ['privacy'],
  usage: 'setting nilai',
  tags: ['owner'],
  command: ['privacy', 'privasi'],
  owner: true,
  run: async (m, { conn, args, usedPrefix, command }) => {
    const privacy = conn._client?.privacy;
    if (!privacy) throw 'Koneksi belum siap.';

    const action = (args[0] || '').toLowerCase();

    // Tanpa argumen: tampilkan setting sekarang beserta pilihan yang sah.
    if (!action) {
      const current = await privacy.getPrivacySettings();
      const rows = SETTINGS.map((setting) => `*${setting}:* ${current?.[setting] ?? '-'}\n  pilihan: ${WA_PRIVACY_SETTING_VALUES[setting].join(', ')}`);
      return m.reply([...rows, '', `*• Ubah:* ${usedPrefix + command} lastSeen contacts`, `*• Lihat deny-list:* ${usedPrefix + command} list lastSeen`, `*• Kecualikan nomor:* ${usedPrefix + command} deny lastSeen 628xxx`, `*• Batalkan kecualian:* ${usedPrefix + command} allow lastSeen 628xxx`].join('\n'));
    }

    if (action === 'list' || action === 'deny' || action === 'allow') {
      const setting = matchSetting(args[1]);
      if (!setting) throw `Setting '${args[1] || ''}' tidak dikenal.\n\nYang punya deny-list: ${DENY_ABLE.join(', ')}`;
      if (!DENY_ABLE.includes(setting)) throw `*${setting}* tidak punya deny-list. Yang punya: ${DENY_ABLE.join(', ')}`;

      if (action === 'list') {
        const { jids, dhash } = await privacy.getDisallowedList(setting);
        if (!jids?.length) return m.reply(`Deny-list *${setting}* kosong.`);
        return m.reply([`*Deny-list ${setting}* (${jids.length})`, ...jids.map((jid) => `• ${jid.split('@')[0]}`), dhash ? `\n_dhash: ${dhash}_` : ''].filter(Boolean).join('\n'));
      }

      const target = args[2] || (m.mentionedJid || [])[0] || m.quoted?.sender;
      if (!target) throw `*• Contoh:* ${usedPrefix + command} ${action} ${setting} 628xxxxxxxxxx`;
      // setDisallowedList sekaligus memindahkan mode ke 'contact_blacklist',
      // jadi tidak perlu dua perintah.
      await privacy.setDisallowedList(setting, action === 'deny' ? { add: [target] } : { remove: [target] });
      return m.reply(`${action === 'deny' ? 'Ditambahkan ke' : 'Dihapus dari'} deny-list *${setting}*: ${String(target).split('@')[0]}`);
    }

    const setting = matchSetting(action);
    if (!setting) throw `Setting '${args[0]}' tidak dikenal.\n\nYang ada: ${SETTINGS.join(', ')}`;

    const allowed = WA_PRIVACY_SETTING_VALUES[setting];
    const value = (args[1] || '').toLowerCase();
    if (!allowed.includes(value)) throw `Nilai untuk *${setting}* harus salah satu dari: ${allowed.join(', ')}\n\n*• Contoh:* ${usedPrefix + command} ${setting} ${allowed[0]}`;

    const dhash = await privacy.setPrivacySetting(setting, value);
    const catatan = value === 'contact_blacklist' ? `\n\nMode-nya saja yang berubah — isi deny-list-nya lewat *${usedPrefix + command} deny ${setting} 628xxx*` : '';
    return m.reply(`*${setting}* sekarang *${value}*.${dhash ? `\n_dhash: ${dhash}_` : ''}${catatan}`);
  }
};

export default handler;
