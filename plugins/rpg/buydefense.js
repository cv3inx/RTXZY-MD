const handler = {
  help: ['buydefense'],
  usage: '<jumlah>',
  tags: ['rpg'],
  command: 'buydefense',
  register: true,
  rpg: true,
  run: async (m, { conn, args }) => {
    if (!args[0] || isNaN(args[0]) || parseInt(args[0]) <= 0) {
      throw '*Example*: .buydefense 100';
    }

    /*conn.sendMessage(m.chat, {
		react: {
			text: '✅',
			key: m.key,
		}
	})*/

    let count = parseInt(args[0]);
    let hrg = 50000;
    let price = count * hrg;
    let users = global.db.data.users;
    let user = users[m.sender];
    if (price > user.money) {
      throw `Maaf, uang kamu tidak cukup untuk membeli ${count} defense. Harga 1 defense adalah ${hrg} money.\n\nMembutuhkan ${price} Money.`;
    }
    user.money -= price;
    user.defense += count;
    conn.reply(m.chat, `Berhasil membeli ${count} defense dengan harga ${price} money.`, m);
  }
};

export default handler;
