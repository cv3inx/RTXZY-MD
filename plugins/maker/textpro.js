let handler = async (m, { conn, command, text, usedPrefix, Api }) => {
  if (!text) throw `🚩 *Contoh:* ${usedPrefix + command} botcahx`;
  const dates = new Date();
  const timestamp = dates.getTime();
  const date = new Date(timestamp);
  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const formattedTime = hour + ':' + minutes + ':' + seconds;
  await conn.reply(m.chat, wait, m);
  try {
    if (command == 'giraffe') {
      const res = Api.url('/api/textpro/giraffe', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'magma') {
      const res = Api.url('/api/textpro/magma', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'hallowen') {
      const res = Api.url('/api/textpro/hallowen-text', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'valentine') {
      const res = Api.url('/api/textpro/valentine', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'valentine2') {
      const res = Api.url('/api/textpro/valentine2', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'neonlight') {
      const res = Api.url('/api/textpro/neon-light', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'neongalaxy') {
      const res = Api.url('/api/textpro/neon-galaxy', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'neongreen') {
      const res = Api.url('/api/textpro/neon-green', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'brokenglass') {
      const res = Api.url('/api/textpro/broken-glass', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'artpapper') {
      const res = Api.url('/api/textpro/art-papper', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glossy') {
      const res = Api.url('/api/textpro/glossy', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'watercolor') {
      const res = Api.url('/api/textpro/water-color', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'multicolor') {
      const res = Api.url('/api/textpro/multi-color', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'robot') {
      const res = Api.url('/api/textpro/robot', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'scifi') {
      const res = Api.url('/api/textpro/scifi', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'neondevil') {
      const res = Api.url('/api/textpro/neon-devil', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'skytext') {
      const res = Api.url('/api/textpro/sky-text', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'vintage') {
      const res = Api.url('/api/textpro/vintage', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'writing') {
      const res = Api.url('/api/textpro/writing', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'engraved') {
      const res = Api.url('/api/textpro/engraved', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'gluetext') {
      const res = Api.url('/api/textpro/glue-text', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'pornhub') {
      const res = Api.url('/api/textpro/pornhub', { text, text2: 'hub' });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'holograpic') {
      const res = Api.url('/api/textpro/holograpic', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'deluxesilver') {
      const res = Api.url('/api/textpro/deluxe-silver', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'fabric') {
      const res = Api.url('/api/textpro/fabric', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'wicker') {
      const res = Api.url('/api/textpro/wicker', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'toxic') {
      const res = Api.url('/api/textpro/toxic-bokeh', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'strawberry') {
      const res = Api.url('/api/textpro/stroberi', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'bread') {
      const res = Api.url('/api/textpro/bread', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'lava') {
      const res = Api.url('/api/textpro/larva', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'koi') {
      const res = Api.url('/api/textpro/koi', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blood') {
      const res = Api.url('/api/textpro/horor-blood', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'honey') {
      const res = Api.url('/api/textpro/honey', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'ice') {
      const res = Api.url('/api/textpro/ice', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'rusty') {
      const res = Api.url('/api/textpro/rusty', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'captainamerica') {
      const res = Api.url('/api/textpro/captain', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'gradient') {
      const res = Api.url('/api/textpro/3d-gradient', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'christmas') {
      const res = Api.url('/api/textpro/christmas', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'dropwater') {
      const res = Api.url('/api/textpro/drop-water', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blackpink') {
      const res = Api.url('/api/textpro/black-pink', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blackpink2') {
      const res = Api.url('/api/textpro/black-pink2', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'wolflogo') {
      const res = Api.url('/api/textpro/logo-wolf', { text: formattedTime, text2: text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'naturalleaves') {
      const res = Api.url('/api/textpro/natural-leaves', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'harrypotter') {
      const res = Api.url('/api/textpro/logo-wolf2', { text: formattedTime, text2: text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == '3dstone') {
      const res = Api.url('/api/textpro/3dstone', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == '1917') {
      const res = Api.url('/api/textpro/1917', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'thunder2') {
      const res = Api.url('/api/textpro/thunder2', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'space') {
      const res = Api.url('/api/textpro/space', { text, text2: formattedTime });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'hallowen2') {
      const res = Api.url('/api/textpro/hallowen', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'jokerlogo') {
      const res = Api.url('/api/textpro/joker-logo', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'blood') {
      const res = Api.url('/api/textpro/blood', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'grafity') {
      const res = Api.url('/api/textpro/grafity-text', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'grafity2') {
      const res = Api.url('/api/textpro/grafity-text2', { text, text2: '' });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch') {
      const res = Api.url('/api/textpro/glitch', { text, text2: formattedTime });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch2') {
      const res = Api.url('/api/textpro/glitch2', { text, text2: formattedTime });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'glitch3') {
      const res = Api.url('/api/textpro/glitch3', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'ninjalogo') {
      const res = Api.url('/api/textpro/ninja-logo', { text, text2: formattedTime });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'avengers') {
      const res = Api.url('/api/textpro/avengers-logo', { text, text2: 'Avengers' });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'marvelstudio') {
      const res = Api.url('/api/textpro/marvel-logo2', { text, text2: 'Studio' });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'marvelstudio2') {
      const res = Api.url('/api/textpro/marvel-logo3', { text, text2: 'Studio' });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
    if (command == 'batman') {
      const res = Api.url('/api/textpro/batman-logo', { text });
      await conn.sendFile(m.chat, res, 'textpro.jpeg', '', m);
    }
  } catch (err) {
    console.error(err);
    throw '🚩 Terjadi kesalahan';
  }
};
handler.command = handler.help = ['giraffe', 'magma', 'batman', 'marvelstudio2', 'marvelstudio', 'avengers', 'ninjalogo', 'glitch3', 'glitch2', 'glitch', 'grafity', 'grafity2', 'blood', 'jokerlogo', 'hallowen2', 'space', 'thunder2', '1917', '3dstone', 'harrypotter', 'wolflogo', 'naturalleaves', 'blackpink', 'blackpink2', 'dropwater', 'christmas', 'gradient', 'captainamerica', 'rusty', 'ice', 'honey', 'blood', 'koi', 'lava', 'bread', 'strawberry', 'toxic', 'wicker', 'fabric', 'pornhub', 'holograpic', 'deluxesilver', 'writing', 'engraved', 'gluetext', 'neondevil', 'skytext', 'vintage', 'multicolor', 'robot', 'scifi', 'artpapper', 'glossy', 'watercolor', 'neongreen', 'brokenglass', 'artpapper', 'valentine2', 'neonlight', 'neongalaxy', 'magma', 'hallowen', 'valentine'];
handler.tags = ['maker'];
handler.limit = true;
export default handler;
