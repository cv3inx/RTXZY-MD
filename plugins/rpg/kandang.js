const handler = {
  help: ['kandang'],
  tags: ['rpg'],
  command: /^(kandang)$/i,
  rpg: true,
  run: async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender];
    let cap = `*━━━ ❨ Kandang Buruan ❩ ━━┄┈*

=> *Berikut Kandang :*  @${m.sender.split`@`[0]}

*🐂 = [ ${user.banteng} ] banteng*
*🐅 = [ ${user.harimau} ] harimau*
*🐘 = [ ${user.gajah} ] gajah*
*🐐 = [ ${user.kambing} ] kambing*
*🐼 = [ ${user.panda} ] panda*
*🐊 = [ ${user.buaya} ] buaya*
*🐃 = [ ${user.kerbau} ] kerbau*
*🐮 = [ ${user.sapi} ] sapi*
*🐒 = [ ${user.monyet} ] monyet*
*🐗 = [ ${user.babihutan} ] babihutan*
*🐖 = [ ${user.babi} ] babi*
*🐓 = [ ${user.ayam} ] ayam*

Gunakan *${usedPrefix}pasar* untuk dijual atau *${usedPrefix}cook* untuk dijadikan bahan masakan.`;

    conn.reply(m.chat, cap, m, { mentions: await conn.parseMention(cap) });
  }
};

export default handler;
