import uploader from '../../../lib/media/uploadImage.js';

const handler = {
  before: async function (m, { conn, Api }) {
    if (!global.db.data.chats[m.chat]?.antiporn) return;
    let target = m;
    let mime = (m.msg || m).mimetype || '';

    if (!/image|gif/.test(mime) && m.quoted) {
      let qmime = (m.quoted.msg || m.quoted).mimetype || '';
      if (/image|gif/.test(qmime)) {
        target = m.quoted;
        mime = qmime;
      }
    }

    if (!/image|gif/.test(mime)) return;

    try {
      let media = await target.download();
      let url = await uploader(media);

      const response = await Api.get('/api/tools/nsfw-detect', { url });
      const res = await response.json();

      if (res.result.labelName === 'Porn') {
        if (target === m.quoted) {
          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: m.msg.contextInfo.stanzaId,
              participant: m.msg.contextInfo.participant
            }
          });
          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: m.key.id,
              participant: m.key.participant
            }
          });
        } else {
          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: m.key.id,
              participant: m.key.participant
            }
          });
        }
        this.reply(m.chat, '⚠️antiporn detected⚠️', null);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

export default handler;
