import fs from 'fs';
const handler = {
  help: ['group'],
  tags: ['owner'],
  command: ['listowner', 'ownerlist'],
  owner: true,
  group: true,
  run: async (m, { conn, isOwner }) => {
    let prem = global.owner.map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter((v) => v != conn.user.jid);
    conn.reply(m.chat, `┌〔 Daftar Owner 〕` + `\n` + owner.map((v) => (isOwner ? '├ @' + v.replace(/@.+/, '') : '│ ' + conn.getName(v))).join`\n` + '\n└────', m, { contextInfo: { mentionedJid: prem } });
  }
};

export default handler;
