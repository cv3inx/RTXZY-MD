import PhoneNumber from 'awesome-phonenumber';
const handler = {
  help: ['mycontact'],
  tags: ['tools'],
  command: ['me', 'save', 'saveme', 'mycontact'],
  group: true,
  limit: true,
  fail: null,
  run: async (m, { conn, text }) => {
    var name;
    if (text) name = text;
    else name = m.name;
    var number = m.sender.split('@')[0];
    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
END:VCARD`;
    conn.sendMessage(m.chat, {
      contacts: {
        displayName: name,
        contacts: [{ vcard }]
      }
    });
  }
};
export default handler;
