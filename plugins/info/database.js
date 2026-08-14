const handler = {
  help: ['database', 'user'],
  tags: ['info'],
  command: /^(database|jumlahdatabase|user)$/i,
  run: async (m) => {
    let totalreg = Object.keys(global.db.data.users).length;
    let rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    m.reply(`*Jumlah database saat ini ${totalreg} user*`);
  }
};
export default handler;
