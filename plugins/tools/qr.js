import qrcode from 'qrcode';

const handler = {
  help: ['', 'code'].map((v) => 'qr' + v + ' <teks>'),
  tags: ['tools'],
  command: /^qr(code)?$/i,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, text }) => {
    if (!text) throw 'teksnya mana?';
    conn.sendFile(m.chat, await qrcode.toDataURL(text.slice(0, 2048), { scale: 8 }), 'qrcode.png', '', m);
  }
};

export default handler;
