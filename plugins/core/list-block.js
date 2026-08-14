const handler = {
  help: ['blocklist'],
  tags: ['info'],
  command: ['listblok', 'listblock', 'bloklist', 'blocklist', 'daftarblok', 'daftarblock', 'blocks'],
  owner: false,
  run: async (m, { conn }) => {
    var block = await conn.fetchBlocklist();
    conn.reply(m.chat, 'List Block:\n\n' + `Total: ${block == undefined ? '*0* Diblokir' : '*' + block.length + '* Diblokir'}\n` + block.map((v) => '乂 @' + v.replace(/@.+/, '')).join`\n`, m, { mentions: block });
  }
};
export default handler;
