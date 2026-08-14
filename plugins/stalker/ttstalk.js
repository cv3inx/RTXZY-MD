const handler = {
  help: ['ttstalk'],
  usage: '<username>',
  tags: ['stalk'],
  command: ['ttstalk', 'tiktokstalk'],
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} chenggu_4`;
    await m.reply(wait);
    try {
      let json = await Api.get('/api/stalk/tt', { username: text }).then((res) => res.json());
      let caption = `⦿  *T I K T O K - S T A L K*\n\n`;
      caption += `	◦  *Username* : ${json.result.username}\n`;
      caption += `	◦  *Description* : ${json.result.description}\n`;
      caption += `	◦  *Likes* : ${json.result.likes}\n`;
      caption += `	◦  *Followers* : ${json.result.followers}\n`;
      caption += `	◦  *Following* : ${json.result.following}\n`;
      caption += `	◦  *Totalposts* : ${json.result.totalPosts}\n\n`;

      await conn.sendMessage(m.chat, { image: { url: json.result.profile }, caption: caption, mentions: [m.sender] }, { quoted: m });
    } catch (e) {
      throw `Error: ${eror}`;
    }
  }
};

export default handler;
