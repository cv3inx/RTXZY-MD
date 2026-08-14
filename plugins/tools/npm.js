import fetch from 'node-fetch';

const handler = {
  help: ['npmsearch'],
  tags: ['tools'],
  command: /^npm(js|search)?$/i,
  run: async (m, { text }) => {
    if (!text) throw 'Input Query';
    let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${text}`);
    let { objects } = await res.json();
    if (!objects.length) throw `Query "${text}" not found :/`;
    let txt = objects.map(({ package: pkg }) => {
      return `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`;
    }).join`\n\n`;
    m.reply(txt);
  }
};
//maapin hyzer
export default handler;
