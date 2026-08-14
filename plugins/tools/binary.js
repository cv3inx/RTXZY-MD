import axios from 'axios';

const handler = {
  help: ['binary'].map((v) => v + ' <teks>'),
  tags: ['tools'],
  command: /^(binary)$/i,
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  exp: 0,
  limit: false,
  run: async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, 'Masukan Teksnya', m);

    axios.get(`https://some-random-api.ml/binary?text=${text}`).then((res) => {
      let hasil = `Teks : ${text}\nBinary : ${res.data.binary}`;

      conn.reply(m.chat, hasil, m);
    });
  }
};

export default handler;
