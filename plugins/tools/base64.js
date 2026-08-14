const handler = {
  help: ['encrypt', 'decrypt'],
  tags: ['tools'],
  command: ['encrypt', 'decrypt'],
  run: async (m, { command, text }) => {
    let txt = m.quoted ? (m.quoted.text ? m.quoted.text : text ? text : m.text) : m.text;
    if (/^encrypt$/i.test(command)) {
      m.reply(Buffer.from(txt, 'utf-8').toString('base64'));
    }
    if (/^decrypt$/i.test(command)) {
      m.reply(Buffer.from(txt, 'base64').toString('utf-8'));
    }
  }
};

export default handler;
