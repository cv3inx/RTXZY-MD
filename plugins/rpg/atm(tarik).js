const moneymins = 1;
const handler = {
  help: ['pull', 'pullall'],
  usage: '*<amount>*',
  tags: ['rpg'],
  command: /^pull([0-9]+)|pull|pullall$/i,
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
    let count = command.replace(/^pull/i, '');
    count = count ? (/all/i.test(count) ? Math.floor(global.db.data.users[m.sender].bank / moneymins) : parseInt(count)) : args[0] ? parseInt(args[0]) : 1;
    if (isNaN(count)) return conn.reply(m.chat, `Masukkan jumlah yang valid, contoh: *pull100*`, m);
    count = Math.max(1, count);
    if (global.db.data.users[m.sender].bank >= moneymins * count) {
      global.db.data.users[m.sender].bank -= moneymins * count;
      global.db.data.users[m.sender].money += count;
      conn.reply(m.chat, `🚩 -${moneymins * count} ATM\n+ ${count} Money`, m);
    } else conn.reply(m.chat, `🚩 ATM you are left ${count} !!`, m);
  }
};

export default handler;
