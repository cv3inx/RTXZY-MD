const handler = {
  help: ['cekpoin'],
  tags: ['rpg'],
  command: 'cekpoin',
  register: true,
  rpg: true,
  run: async (m) => {
    let poin = global.db.data.users[m.sender].poin || 0;
    m.reply(`Poin kamu: ${poin}`);
  }
};

export default handler;
