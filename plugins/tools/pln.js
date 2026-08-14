const handler = {
  command: ['cekbillpln', 'tagihanpln', 'pln'],
  help: ['cekbillpln', 'tagihanpln', 'pln'],
  tags: ['tools'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} 172720204487`;
    m.reply(wait);
    try {
      let res = await (await Api.get('/api/tools/cekbillpln', { id: text })).json();
      let content = `*T A G I H A N  P L N*\n\n`;

      if (res.status && res.result) {
        content += `  ◦ *ID Pelanggan:* ${res.result['Nomor ID Pelanggan']}\n`;
        content += `  ◦ *Nama:* ${res.result['Nama Pelanggan']}\n`;
        content += `  ◦ *Jumlah Tagihan:* ${res.result['Jumlah Tagihan']}\n`;
        content += `  ◦ *Periode:* ${res.result['Periode']}\n`;
        content += `  ◦ *Stand Meter:* ${res.result['Stand Meter']}\n`;
        content += `  ◦ *Tarif/Daya:* ${res.result['Tarif / Daya']}\n`;
        content += `  ◦ *Denda:* ${res.result['Denda']}\n`;
        content += `  ◦ *Biaya Admin:* ${res.result['Biaya Admin']}\n`;
      } else {
        content += 'Data tagihan tidak ditemukan.';
      }
      await m.reply(content);
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
