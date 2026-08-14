let handler = async (m, { text, usedPrefix, command, Api }) => {
  if (!text) throw `Input Text Dan Karakter!\nExample: ${usedPrefix + command} Kirito|kamu sedang apa?`;
  try {
    let [logic, prompt] = text.split('|');
    m.reply(`Tunggu sebentar...`);
    let res = await Api.get('/api/search/c-ai', { char: logic, prompt });
    let json = await res.json();
    m.reply(json.message);
  } catch (e) {
    throw eror;
  }
};

handler.command = handler.help = ['c-ai', 'character-ai', 'cai'];
handler.tags = ['ai'];
handler.owner = false;
handler.limit = true;
handler.group = false;
handler.private = false;

export default handler;
