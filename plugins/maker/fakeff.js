const handler = {
  help: ['fakeff <username|lobby>'],
  tags: ['maker'],
  command: /^(fakeff)$/i,
  limit: true,
  group: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    let guide = `Format salah!\n\n*Cara penggunaan:*\n${usedPrefix + command} username|lobby\n\n*Pilihan Lobby:*\nAngka 1 sampai 45\n\n*Contoh:*\n${usedPrefix + command} ProPlayer123|6`;

    if (!text) throw guide;
    let [username, lobby] = text.split('|');
    if (!username || !lobby) {
      throw guide;
    }
    let lobbyNum = parseInt(lobby.trim());
    if (isNaN(lobbyNum) || lobbyNum < 1 || lobbyNum > 45) {
      throw `*❌ Lobby tidak valid!*\n\nMasukkan angka dari 1 sampai 45.`;
    }
    try {
      await m.reply('⏳ _Sedang memproses gambar..._');

      let apiUrl = Api.url('/api/maker/canvas-fakeFf', { lobby: lobbyNum, username: username.trim() });

      await conn.sendFile(m.chat, apiUrl, 'fakeff.jpg', 'Done!', m);
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
