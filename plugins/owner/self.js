const handler = {
  help: ['self', 'public'],
  tags: ['owner'],
  owner: true,
  command: ['self', 'public'],
  run: async (m, { conn, command }) => {
    let isPublic = command === 'public';
    let self = global.opts['self'];

    if (self === !isPublic) return m.reply(`Dah ${!isPublic ? 'Self' : 'Public'} dari tadi ${m.sender.split('@')[0] === global.config.access.owner[1] ? 'Mbak' : 'Bang'} :v`);

    global.opts['self'] = !isPublic;

    m.reply(`Berhasil ${!isPublic ? 'Self' : 'Public'} bot!`);
  }
};

export default handler;
