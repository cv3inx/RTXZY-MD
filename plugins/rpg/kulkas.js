const handler = {
  help: ['kulkas'],
  command: ['kulkas'],
  tags: ['rpg'],
  register: true,
  rpg: true,
  run: async (m, { command, usedPrefix, args }) => {
    let user = global.db.data.users[m.sender];

    const list = `╭───────────────
│⬡ 🍖 *Ayambakar* : ${user.ayambakar}
│⬡ 🍖 *ikan bakar* : ${user.ikanbakar}
│⬡ 🍖 *lele bakar* : ${user.lelebakar}
│⬡ 🍖 *nila bakar* : ${user.nilabakar}
│⬡ 🍖 *bawal bakar* : ${user.bawalbakar}
│⬡ 🍖 *udang bakar* : ${user.udangbakar}
│⬡ 🍖 *paus bakar* : ${user.pausbakar}
│⬡ 🍖 *kepiting bakar* : ${user.kepitingbakar}
│⬡ 🍗 *Ayamgoreng* : ${user.ayamgoreng}
│⬡ 🥘 *Rendang* : ${user.rendang}
│⬡ 🥩 *Steak* : ${user.steak}
│⬡ 🥠 *Babipanggang* : ${user.babipanggang}
│⬡ 🍲 *Gulaiayam* : ${user.gulai}
│⬡ 🍜 *Oporayam* : ${user.oporayam}
│⬡  🍞 *Roti* : ${user.roti}
│⬡ 🍣 *Sushi* : ${user.sushi}
│⬡ 🍷 *Vodka* : ${user.vodka}
│⬡ 💉 *Bandage* : ${user.bandage}
│⬡ ☘️ *Ganja* : ${user.ganja}
│⬡ 🍺 *Soda* : ${user.soda}
╰───────────────`;
    m.reply(list);
  }
};
export default handler;
