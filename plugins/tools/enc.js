import JavaScriptObfuscator from 'javascript-obfuscator';

const handler = {
  help: ['enc'],
  tags: ['tools'],
  command: /^enc$/i,
  run: async (m, { conn, text }) => {
    if (!text) throw `[!] Masukan textnya`;
    let res = JavaScriptObfuscator.obfuscate(text);
    conn.reply(m.chat, res.getObfuscatedCode(), m);
  }
};

export default handler;
