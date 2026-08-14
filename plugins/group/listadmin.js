const handler = {
  help: ['listadmin'],
  tags: ['group'],
  command: /^(adminlist|listadmin)$/i,
  group: true,
  register: false,
  run: async (m, { conn, args, participants }) => {
    let grup = await conn.getName(m.key.remoteJid);
    let mimin = m.isGroup ? getAdmin(participants) : '';
    let txt = `List Admin Group *${grup}*\n*Total:* ${mimin.length}\n\n`;
    for (let min of mimin) {
      txt += `• @${min.split('@')[0]}\n`;
    }
    conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) });
  }
};
export default handler;

const getAdmin = (participants) => {
  let getAdminAll = [];
  for (let b of participants) {
    b.admin === 'admin' ? getAdminAll.push(b.id) : '';
    b.admin === 'superadmin' ? getAdminAll.push(b.id) : '';
  }
  return getAdminAll;
};
