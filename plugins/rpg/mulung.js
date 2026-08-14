const timeout = 28800000;

const handler = {
  help: ['mulung'],
  tags: ['rpg'],
  command: /^(mulung)/i,
  group: true,
  fail: null,
  limit: true,
  exp: 0,
  money: 0,
  rpg: true,
  run: async (m, { conn, usedPrefix, text }) => {
    let time = global.db.data.users[m.sender].lastturu + 28800000;
    if (new Date() - global.db.data.users[m.sender].lastturu < 28800000) throw `Anda sudah memulung\nMohon tunggu selama ${msToTime(time - new Date())} untuk mulung lagi`;
    let botolnye = `${Math.floor(Math.random() * 1000)}`.trim();
    let kalengnye = `${Math.floor(Math.random() * 1000)}`.trim();
    let kardusnye = `${Math.floor(Math.random() * 1000)}`.trim();
    global.db.data.users[m.sender].botol += botolnye * 1;
    global.db.data.users[m.sender].kaleng += kalengnye * 1;
    global.db.data.users[m.sender].kardus += kardusnye * 1;
    global.db.data.users[m.sender].lastturu = new Date() * 1;
    conn.reply(m.chat, `Selamat kamu mendapatkan : \n+${botolnye} Botol\n+${kardusnye} Kardus\n+${kalengnye} Kaleng`, m);
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
