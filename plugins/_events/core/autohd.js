import uploadImage from '../../lib/media/uploadImage.js';

let handler = (m) => m;

handler.all = async function (m, chatUpdate, Api) {
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];

  if (chat && chat.autohd && !chat.isBanned && !user.banned && !m.isZapo) {
    let q = m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      try {
        let img = await q.download();
        if (!img) return;
        let out = await uploadImage(img);

        const api = await Api.get('/api/tools/remini', { url: out });
        const image = await api.json();
        const url = image.url;

        if (url) {
          await this.sendFile(m.chat, url, 'hd.jpg', '✅ *Auto HD Berhasil*', m);
        }
      } catch (e) {
        console.error('Error auto HD image:', e);
      }
    }
  }
  return !0;
};

export default handler;
