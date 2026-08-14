const moneyplus = 1;
const handler = {
  help: ['atm *<amount>*', 'atmall'],
  tags: ['rpg'],
  command: /^(atm([0-9]+)|atm|atmall)$/i,
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  limit: true,
  admin: false,
  botAdmin: false,
  rpg: true,
  fail: null,
  exp: 0,
  run: async (m, { conn, command, args }) => {
    let count = command.replace(/^atm/i, '');
    count = count ? (/all/i.test(count) ? Math.floor(global.db.data.users[m.sender].money / moneyplus) : parseInt(count)) : args[0] ? parseInt(args[0]) : 1;
    if (isNaN(count)) return conn.reply(m.chat, `Masukkan jumlah yang valid, contoh: *atm100*`, m);
    count = Math.max(1, count);
    if (global.db.data.users[m.sender].money >= moneyplus * count) {
      global.db.data.users[m.sender].money -= moneyplus * count;
      global.db.data.users[m.sender].bank += count;
      conn.reply(m.chat, `🚩 -${moneyplus * count} Money\n+ ${count} ATM`, m);
    } else conn.reply(m.chat, `🚩 Money not enough to save ${count} ATM`, m);
  }
};

export default handler;
