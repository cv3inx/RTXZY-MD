/*
   Created By Dana
   Source From: https://github.com/DanaPutra133/Aquabot-V3/blob/main/aqua%20bot/plugins/search-cerpen.js
   Github: https://github.com/DanaPutra133/Aquabot-V3/
   Created At: 13 June 2024
   Dont Delete This Watermark and Sell This Code !!!!
*/

//mulai

const handler = {
  help: ['cerpenremaja', 'cerpenanak', 'cerpenbudaya', 'cerpenmisteri', 'cerpenromantis', 'cerpencinta', 'cerpengokil', 'cerpengalau', 'cerpenkehidupan', 'cerpeninspiratif', 'cerpensastra', 'cerpenjepang', 'cerpenkorea', 'cerpenkeluarga', 'cerpenpersahabatan', 'cerpenkristen', 'cerpenramadhan', 'cerpenhiburan', 'cerpenlingkungan', 'cerpenmengharukan'],
  command: ['cerpenremaja', 'cerpenanak', 'cerpenbudaya', 'cerpenmisteri', 'cerpenromantis', 'cerpencinta', 'cerpengokil', 'cerpengalau', 'cerpenkehidupan', 'cerpeninspiratif', 'cerpensastra', 'cerpenjepang', 'cerpenkorea', 'cerpenkeluarga', 'cerpenpersahabatan', 'cerpenkristen', 'cerpenramadhan', 'cerpenhiburan', 'cerpenlingkungan', 'cerpenmengharukan'],
  tags: ['internet'],
  limit: true,
  run: async (m, { conn, command, Api }) => {
    try {
      let cerdn = `----( *${command.toUpperCase()}* )----\n\n`;

      if (command === 'cerpenremaja') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'remaja' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenanak') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'anak' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenmisteri') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'misteri' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenbudaya') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'budaya' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenromantis') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'romantis' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpengalau') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'galau' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpengokil') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'gokil' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpeninspiratif') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'inspiratif' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenkehidupan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'kehidupan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpensastra') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'sastra' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenjepang') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'jepang' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenkorea') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'korea' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenkeluarga') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'keluarga' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenpersahabatan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'persahabatan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenkristen') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'kristen' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenramadhan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'ramadhan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenliburan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'liburan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenlingkungan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'lingkungan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      } else if (command === 'cerpenmengharukan') {
        const res = await (await Api.get('/api/story/cerpen', { type: 'mengharukan' })).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `;
      }

      await m.reply(cerdn);
    } catch (e) {
      console.log(e);
      m.reply('Maaf, cerpen tidak di temukan');
      await conn.sendMessage(m.chat, {
        react: {
          text: '😞',
          key: m.key
        }
      });
    }
  }
};

export default handler;

//dana_putra13
