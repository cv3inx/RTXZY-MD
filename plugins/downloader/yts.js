import yts from 'yt-search';
const handler = {
  help: ['yts', 'ytsearch'],
  usage: '<pencarian>',
  tags: ['tools', 'internet', 'downloader'],
  command: ['yts', 'ytsearch'],
  limit: true,
  run: async (m, { text }) => {
    if (!text) throw 'Cari apa?';
    let results = await yts(text);
    let teks = results.all
      .map((v) => {
        switch (v.type) {
          case 'video':
            return `
*${v.title}* (${v.url})
Duration: ${v.timestamp}
Uploaded ${v.ago}
${v.views} views
      `.trim();
          case 'channel':
            return `
*${v.name}* (${v.url})
_${v.subCountLabel} (${v.subCount}) Subscriber_
${v.videoCount} video
`.trim();
        }
      })
      .filter((v) => v)
      .join('\n========================\n');
    m.reply(teks);
  }
};

export default handler;
