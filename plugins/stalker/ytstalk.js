const handler = {
  help: ['ytstalk'],
  tags: ['stalk'],
  command: /^(youtubestalk|ytstalk)$/i,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Contoh:\n${usedPrefix + command} deaafrizal`;
    await m.reply(wait);
    try {
      let res = await (await Api.get('/api/stalk/yt', { username: text })).json();

      if (res.status && res.result && res.result.data && res.result.data.length > 0) {
        let data = res.result.data[0];
        let { channelId, url, channelName, avatar, isVerified, subscriberH, subscriber, description } = data;

        let capt;
        capt = `乂 *Y O U T U B E   S T A L K*\n\n`;
        capt += `◦ *ID* : ${channelId}\n`;
        capt += `◦ *Name* : ${channelName}\n`;
        capt += `◦ *Subscriber* : ${subscriberH}\n`;
        capt += `◦ *Verified* : ${isVerified}\n`;
        capt += `◦ *URL* : ${url}\n`;
        if (description) capt += `◦ *Description* : ${description}\n`;

        return await conn.sendMessage(m.chat, { image: { url: avatar }, caption: capt, mentions: [m.sender] }, { quoted: m });
      } else {
        throw 'Channel tidak ditemukan!';
      }
    } catch (e) {
      m.reply('Sistem Sedang Bermasalah!');
    }
  }
};

export default handler;
