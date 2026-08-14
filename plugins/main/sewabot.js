const handler = {
  help: ['sewabot'],
  tags: ['main'],
  command: /^(sewa|sewabot)$/i,
  run: async (m, { conn, command }) => {
    let txt = `*[ Chat Dengan Creator ]*
wa.me/${numberowner}

╔╣ *PREMIUM USER*
║ • 10.000 Limit
║ • Full Akses Chat
╚══╣ *Harga :* Rp.10.000 / bulan

╔╣ *SEWA BOT*
║ • Dapat Premium
║ • Bebas Invit ke 1 Grup
╚══╣ *Harga :* Rp.15.000 / bulan

- Pembayaran via *OVO / Dana / GoPay, Qris, Bank*
  *( tidak ada opsi lain )*
  ke nomor ${numberowner}
- Whatsapp Multi Device
- Run via Panel (Always ON)`;

    await m.reply(txt);
  }
};

export default handler;
