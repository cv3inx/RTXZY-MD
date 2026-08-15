const handler = {
  help: ['petshop'],
  tags: ['rpg'],
  command: ['pet', 'petshop', 'petstore', 'adopt'],
  register: true,
  rpg: true,
  run: async (m, { conn, command, args, usedPrefix, DevMode }) => {
    let type = (args[0] || '').toLowerCase();
    let _type = (args[0] || '').toLowerCase();
    let user = global.db.data.users[m.sender];
    global.db.data.users[m.sender].pickaxe = global.db.data.users[m.sender].pickaxe || 0;
    global.db.data.users[m.sender].pedang = global.db.data.users[m.sender].pedang || 0;
    global.db.data.users[m.sender].fishingrod = global.db.data.users[m.sender].fishingrod || 0;

    //----------HARGA
    let hkucing = 10;
    let hanjing = 10;
    let hserigala = 25;
    let hrubah = 50;
    let hphonix = 150;

    let logo = `— *P E T   S T O R E* —
▮▧▧▧▧▧▧▧▧▧▧▧▧▮`;
    let caption = `
🐈 *kucing:* ${hkucing} pet
🐕 *anjing:* ${hanjing} pet
🐺 *serigala:* ${hserigala} pet
🦊 *rubah:* ${hrubah} pet
🐦‍🔥 *phonix:* ${hphonix} pet

〉 *ABILITY*
Cooming soon..

〉 *Example*
${usedPrefix}adopt kucing`.trim();

    try {
      if (/pet(store|shop)?|adopt/i.test(command)) {
        const count = args[1] && args[1].length > 0 ? Math.min(99999999, Math.max(parseInt(args[1]), 1)) : !args[1] || args.length < 3 ? 1 : Math.min(1, count);
        switch (type) {
          case 'kucing':
            if (user.kucing > 0) return m.reply('Kamu sudah memilik ini');
            if (user.pet < hkucing) return m.reply(`Pet Token anda kurang`);
            global.db.data.users[m.sender].pet -= hkucing;
            global.db.data.users[m.sender].kucing += 1;
            m.reply('Selamat anda mempunyai pet Baru ! 🎉');
            break;
          case 'anjing':
            if (user.anjing > 0) return m.reply('Kamu sudah memilik ini');
            if (user.pet < hanjing) return m.reply(`Pet Token anda kurang`);
            global.db.data.users[m.sender].pet -= hanjing;
            global.db.data.users[m.sender].anjing += 1;
            m.reply('Selamat anda mempunyai pet Baru ! 🎉');
            break;
          case 'rubah':
            if (user.rubah > 0) return m.reply('Kamu sudah memilik ini');
            if (user.pet < hrubah) return m.reply(`Pet Token anda kurang`);
            global.db.data.users[m.sender].pet -= hrubah;
            global.db.data.users[m.sender].rubah += 1;
            m.reply('Selamat anda mempunyai pet Baru ! 🎉');
            break;
          case 'phonix':
            if (user.phonix > 0) return m.reply('Kamu sudah memilik ini');
            if (user.pet < hphonix) return m.reply(`Pet Token anda kurang`);
            global.db.data.users[m.sender].pet -= hphonix;
            global.db.data.users[m.sender].phonix += 1;
            m.reply('Selamat anda mempunyai pet Baru ! 🎉');
            break;
          case 'serigala':
            if (user.serigala > 0) return m.reply('Kamu sudah memilik ini');
            if (user.pet < hserigala) return m.reply(`Pet Token anda kurang`);
            global.db.data.users[m.sender].pet -= hserigala;
            global.db.data.users[m.sender].serigala += 1;
            m.reply('Selamat anda mempunyai pet Baru ! 🎉');
            break;

          default:
            return await m.reply(`${logo}\n${caption}`);
        }
      }
    } catch (err) {
      m.reply('Error\n\n\n' + err.stack);
    }
  }
};

export default handler;
