const handler = {
  command: ['pesan', 'chat'],
  rowner: false,
  limit: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, text, usedPrefix }) => {
    let [number, pesan] = text.split`|`;

    if (!number) return conn.reply(m.chat, 'Silahkan masukan nomor yang akan dikirim\n_Contoh : .pesan 6281395861695|Halo Bang_', m);
    if (!pesan) return conn.reply(m.chat, 'Silahkan masukan pesannya\n_Contoh : .pesan 6281395861695|Halo Bang_', m);
    if (text > 500) return conn.reply(m.chat, 'Teks Kepanjangan!', m);

    let user = global.db.data.users[m.sender];

    let korban = `${number}`;
    var nomor = m.sender;
    let spam1 = `*「 PENITIPAN PESAN 」*\n\nUntuk : wa.me/${korban}\nPesan : ${pesan}\n\n*${global.wm}*`;

    conn.reply(korban + '@s.whatsapp.net', spam1, m);

    let logs = `[ ✔️ ] Berhasil mengirim pesan wa ke nomor wa.me/${korban}`;
    conn.reply(m.chat, logs, m);
  }
};

export default handler;
