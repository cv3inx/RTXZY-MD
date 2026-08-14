const handler = {
  help: ['gay', 'pintar', 'cantik', 'ganteng', 'gabut', 'gila', 'lesbi', 'stress', 'bucin', 'jones', 'sadboy'].map((v) => v + 'cek'),
  tags: ['kerang'],
  command: /^(gay|pintar|cantik|ganteng|gabut|gila|lesbi|stress?|bucin|jones|sadboy)cek/i,
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, usedPrefix, command, text }) => {
    let memek = 'https://telegra.ph/file/1aa347ff346c2bf5ee181.jpg';
    let anu = `
────〔 *${command}* 〕────

${command.replace('cek', '').toUpperCase()} LEVEL *${Math.floor(Math.random() * 101)}*% 

Seberapapun *${command.replace('cek', '').toUpperCase()}* Mu
Tetap *SYUKURI* itu`;
    m.reply(anu);
  }
};

export default handler;
