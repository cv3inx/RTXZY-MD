const handler = {
  command: ['2fa', 'authenticator', 'autentikator'],
  help: ['2fa', 'authenticator', 'autentikator'],
  tags: ['tools'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} <token>`;
    m.reply(wait);
    try {
      let res = await (await Api.get('/api/tools/2fa', { token: text })).json();
      let content = `*2FA Verification Result*\n\n`;

      if (res.status && res.result) {
        content += `  ◦ *Token:* ${res.result.token}\n`;
      } else {
        content += 'Token gagal didapatkan!.';
      }
      await m.reply(content);
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
