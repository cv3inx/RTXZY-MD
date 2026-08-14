const free = 5000;
const prem = 10000;
const moneyfree = 5000;
const moneyprem = 10000;
const timeout = 3600000;

const handler = {
  help: ['hourly'],
  tags: ['rpgabsen'],
  command: /^(hourly)$/i,
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  rpg: true,
  admin: false,
  botAdmin: false,
  fail: null,
  money: 0,
  exp: 0,
  limit: true,
  run: async (m, { conn, isPrems }) => {
    let time = global.db.data.users[m.sender].lasthourly + 3600000;
    if (new Date() - global.db.data.users[m.sender].lasthourly < 3600000) return conn.reply(m.chat, `Anda sudah mengklaim, klaim harian hari ini\ntunggu selama ${msToTime(time - new Date())} lagi`, m);
    //  conn.reply(m.chat, `Anda sudah mengklaim dan mendapatkan :`, m)
    global.db.data.users[m.sender].exp += isPrems ? prem : free;
    global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree;
    // global.db.data.users[m.sender].potion += 5
    conn.reply(m.chat, `Selamat kamu mendapatkan:\n\n+${isPrems ? prem : free} Exp\n+${isPrems ? moneyprem : moneyfree} Money`, m);
    global.db.data.users[m.sender].lasthourly = new Date() * 1;
  }
};

export default handler;

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ' jam ' + minutes + ' menit ' + seconds + ' detik';
}
