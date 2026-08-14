const handler = {
  help: ['purba <teks>'],
  tags: ['fun'],
  command: /^(purba)$/i,
  run: function (m, { text }) {
    let teks = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.text;
    m.reply(teks.replace(/[aiueo]/gi, '$&ve'));
  }
};

export default handler;
