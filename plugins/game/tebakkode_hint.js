const handler = {
  command: 'kdo',
  limit: true,
  run: async (m, { conn }) => {
    conn.tebakkode = conn.tebakkode ? conn.tebakkode : {};
    let id = m.chat;
    if (!(id in conn.tebakkode)) throw false;
    let json = conn.tebakkode[id][1];
    let ans = json.jawaban;
    // kalau ini error clue nya ak mau ada tanda (_) nya ganti string dalam function di bawah ini jadi huruf kecil
    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz123456789]/g, '_');
    m.reply('```' + clue + '```');
  }
};
export default handler;

//gh: dana_putra13
