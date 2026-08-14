const handler = {
  help: ['emailcheck <email1, email2, ...>'],
  tags: ['tools'],
  command: /^(emailcheck|emailcek|cekmail)$/i,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} jokowi@gmail.com, aaa@gmail.com, bbbb@gmail.com`;

    let emails = text
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    if (emails.length === 0) throw `*Example:* ${usedPrefix + command} jokowi@gmail.com, aaa@gmail.com, bbbb@gmail.com`;

    try {
      await m.reply(wait);

      let response = await Api.post('/api/tools/email-check', { email: JSON.stringify(emails) });

      let json = await response.json();
      let res = json.result;

      let caption = `⦿  *E M A I L - C H E C K E R*\n\n`;
      caption += `	◦  *Total Emails* : ${res.statistics?.total || 0}\n`;
      caption += `	◦  *Active* : ${res.statistics?.active || 0}\n`;
      caption += `	◦  *Inactive* : ${res.statistics?.inactive || 0}\n`;
      caption += `	◦  *Active %* : ${res.statistics?.active_percentage || '0%'}\n`;
      caption += `	◦  *Inactive %* : ${res.statistics?.inactive_percentage || '0%'}\n\n`;

      if (res.active_emails && res.active_emails.length > 0) {
        caption += `	⭔ *Active Emails*\n`;
        res.active_emails.forEach((email) => {
          caption += `	✅ ${email}\n`;
        });
        caption += `\n`;
      }

      if (res.inactive_emails && res.inactive_emails.length > 0) {
        caption += `	⭔ *Inactive Emails*\n`;
        res.inactive_emails.forEach((email) => {
          caption += `	❌ ${email}\n`;
        });
        caption += `\n`;
      }

      await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
