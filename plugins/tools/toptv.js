const handler = {
  help: ['ptv', 'toptv'],
  command: ['toptv', 'ptv', 'ptvmessage'],
  tags: ['tools'],
  limit: true,
  run: async (m, { conn, command, usedPrefix }) => {
    try {
      if (m.message.extendedTextMessage) {
        if (!m.message.extendedTextMessage.contextInfo?.quotedMessage?.videoMessage) {
          throw `Balas video dengan perintah ${usedPrefix + command}`;
        }

        var datavid = { ptvMessage: m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage };
        conn.relayMessage(m.chat, datavid, {});
      } else {
        if (!m.message.videoMessage) {
          throw `Balas video dengan perintah ${usedPrefix + command}`;
        }

        var datavid = { ptvMessage: m.message.videoMessage };
        conn.relayMessage(m.chat, datavid, {});
      }
    } catch (error) {
      m.reply(error.toString());
    }
  }
};
export default handler;
