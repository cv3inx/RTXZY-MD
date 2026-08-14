const __filename = import.meta.filename;
import simple, { isNewsletterJid, resolveLidJid } from './lib/simple.js';
import util from 'util';
import print from './lib/system/print.js';
import { ensureUserAndChatDefaults } from './lib/system/userDefaults.js';
import Api from './lib/system/api.js';

const isNumber = (x) => typeof x === 'number' && !isNaN(x);
const delay = (ms) => isNumber(ms) && new Promise((resolve) => setTimeout(resolve, ms));

export default {
  async handler(chatUpdate) {
    if (global.db.data == null) await loadDatabase();
    this.msgqueque = this.msgqueque || [];
    // console.log(chatUpdate)
    if (!chatUpdate) return;
    // if (chatUpdate.messages.length > 2 || !chatUpdate.messages.length) return
    // if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;
    // Skip messages from channels/newsletters - bot only serves group & private chat
    if (isNewsletterJid(m.key?.remoteJid)) return;
    //console.log(JSON.stringify(m, null, 4))
    try {
      m = simple.smsg(this, m) || m;
      if (!m) return;
      if (isNewsletterJid(m.chat)) return;
      if (m.chat && m.isGroup && !global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = { detect: true, delete: true };
      }
      if (m.isGroup && !global.db.data._migratedDetect) {
        global.db.data._migratedDetect = true;
        for (const [jid, chat] of Object.entries(global.db.data.chats)) {
          if (jid.endsWith('@g.us') && chat && !chat.detect) chat.detect = true;
        }
      }

      if (m.messageStubType && m.isGroup) {
        let chat = global.db.data.chats[m.chat];
        if (chat && chat.detect) {
          let text = '';
          if (m.messageStubType === 21) {
            text = (chat.sSubject || this.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', m.messageStubParameters[0]);
          } else if (m.messageStubType === 22) {
            // messageStubParameters[0] = action picture: 'set' | 'delete' | 'set_avatar'
            let picAction = m.messageStubParameters[0];
            if (picAction === 'delete') {
              text = chat.sIconDel || this.sIconDel || '```Icon has been removed```';
            } else {
              let iconUrl = await this.profilePictureUrl(m.chat, 'image').catch(() => 'Image deleted / Not available');
              text = (chat.sIcon || this.sIcon || '```Icon has been changed to```\n@icon').replace('@icon', iconUrl);
            }
          } else if (m.messageStubType === 23) {
            let code = m.messageStubParameters[0];
            if (!code) {
              for (let attempt = 0; attempt < 3 && !code; attempt++) {
                code = await this.groupInviteCode(m.chat).catch(() => '');
                if (!code && attempt < 2) await delay(800);
              }
            }
            text = code ? (chat.sRevoke || this.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', `https://chat.whatsapp.com/${code}`) : chat.sRevoke || this.sRevoke || '```Group link has been revoked```';
          } else if (m.messageStubType === 24) {
            let desc = m.messageStubParameters[0];
            text = desc ? (chat.sDesc || this.sDesc || '```Description has been changed to```\n@desc').replace('@desc', desc) : chat.sDesc || this.sDesc || '```Description has been removed```';
          } else if (m.messageStubType === 25) {
            text = m.messageStubParameters[0] === 'on' ? '```Group info has been restricted to admin only```' : '```Group info can now be modified by all participants```';
          } else if (m.messageStubType === 26) {
            text = m.messageStubParameters[0] === 'on' ? '```Group has been closed, only admins can send messages```' : '```Group has been opened, all participants can send messages```';
          }
          if (text) {
            await this.sendMessage(m.chat, { text, mentions: this.parseMention(text) });
          }
        }
      }

      // console.log(m)
      m.exp = 0;
      m.limit = false;
      await ensureUserAndChatDefaults(m, this);
      if (opts['nyimak']) return;
      let isOwnerSelf = false;
      if (global.config.access.owner && Array.isArray(global.config.access.owner)) {
        isOwnerSelf = global.config.access.owner.some((o) => {
          let number = Array.isArray(o) ? o[0] : o;
          return (
            typeof number === 'string' &&
            String(m.sender || '')
              .replace(/[^0-9]/g, '')
              .startsWith(number)
          );
        });
      }
      if (!m.fromMe && !isOwnerSelf && opts['self']) return;
      if (opts['pconly'] && m.chat.endsWith('g.us')) return;
      if (opts['gconly'] && !m.chat.endsWith('g.us')) return;
      if (opts['swonly'] && m.chat !== 'status@broadcast') return;
      if (typeof m.text !== 'string') m.text = '';
      if (opts['queque'] && m.text) {
        this.msgqueque.push(m.id || m.key.id);
        await delay(this.msgqueque.length * 1000);
      }
      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        if (!plugin.all) continue;
        if (typeof plugin.all !== 'function') continue;
        try {
          await plugin.all.call(this, m, chatUpdate, Api);
        } catch (e) {
          if (typeof e === 'string') continue;
          console.error(e);
        }
      }
      //if (m.id.startsWith('BAE5') && m.id.length === 16 || m.isZapo && m.fromMe) return
      if (m.id.startsWith('3EB0') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.isZapo && m.fromMe)) return;
      m.exp += Math.ceil(Math.random() * 10);

      let usedPrefix;
      let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];

      //let isROwner = [global.conn.user.jid, ...global.config.access.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
      /**let isROwner = [global.conn.user.jid, ...global.config.access.owner]
              .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
              .includes(
                m.sender.endsWith('@lid') 
                  ? conn.getJid(m.sender)?.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                  : m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
              );**/
      let isROwner = [global.conn?.user?.jid, ...(global.config.access.owner || [])]
        .filter((v) => v != null)
        .map((v) => String(v).replace(/[^0-9]/g, ''))
        .includes(String((this.getJid ? this.getJid(m.sender) : null) || m.sender).replace(/[^0-9]/g, ''));
      let isOwner = isROwner || m.fromMe;
      let isMods = isOwner || global.config.access.mods.map((v) => v.replace(/[^0-9]/g, '')).includes(String(m.sender).replace(/[^0-9]/g, ''));
      let isPrems = isROwner || db.data.users[m.sender].premiumTime > 0 || db.data.users[m.sender].premium;

      // const groupMetadata = (m.isGroup ? (conn.chats[m.chat] || {}).metadata || (await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
      // const participants = (m.isGroup ? groupMetadata.participants : []) || [];
      // const user = (m.isGroup ? participants.find((u) => conn.getJid(u.id) === m.sender) : {}) || {}; // User Data
      // const bot = (m.isGroup ? participants.find((u) => conn.getJid(u.id) == this.user.jid) : {}) || {}; // Your Data
      // const isRAdmin = user?.admin == 'superadmin' || false;
      // const isAdmin = isRAdmin || user?.admin == 'admin' || false; // Is User Admin?
      // const isBotAdmin = bot?.admin || false; // Are you Admin?

      const groupMetadata = (m.isGroup ? (conn.chats[m.chat] || {}).metadata || (await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
      const participants = (m.isGroup ? groupMetadata.participants : []) || [];

      const _digits = (j) =>
        String(j || '')
          .replace(/:\d+@/g, '@')
          .replace(/[^0-9]/g, '');
      const _senderDigits = _digits(m.sender);
      const _botDigits = _digits(this.user?.jid);
      const _match = (u, digits) => !!digits && (_digits(u.phoneNumber) === digits || _digits(u.jid || u.id) === digits);
      const user = participants.find((u) => _match(u, _senderDigits)) || {};
      const bot = participants.find((u) => _match(u, _botDigits)) || {};

      const isRAdmin = user?.admin === 'superadmin' || false;
      const isAdmin = isRAdmin || user?.admin === 'admin' || false;
      const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin' || false;
      for (let name in global.plugins) {
        let plugin = global.plugins[name];
        if (!plugin) continue;
        if (plugin.disabled) continue;
        if (!opts['restrict'])
          if (plugin.tags && plugin.tags.includes('admin')) {
            // global.dfail('restrict', m, this)
            continue;
          }
        const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
        let match = (
          _prefix instanceof RegExp // RegExp Mode?
            ? [[_prefix.exec(m.text), _prefix]]
            : Array.isArray(_prefix) // Array?
              ? _prefix.map((p) => {
                  let re =
                    p instanceof RegExp // RegExp in Array?
                      ? p
                      : new RegExp(str2Regex(p));
                  return [re.exec(m.text), re];
                })
              : typeof _prefix === 'string' // String?
                ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
                : [[[], new RegExp()]]
        ).find((p) => p[1]);
        if (typeof plugin.before === 'function')
          if (
            await plugin.before.call(this, m, {
              match,
              conn: this,
              Api,
              participants,
              groupMetadata,
              user,
              bot,
              isROwner,
              isOwner,
              isAdmin,
              isBotAdmin,
              isPrems,
              chatUpdate
            })
          )
            continue;
        // New-style plugins are a plain object with a `run` method instead of
        // being callable themselves; old-style plugins are the callable itself.
        let run = typeof plugin.run === 'function' ? plugin.run : typeof plugin === 'function' ? plugin : null;
        if (!run) continue;
        let hasPrefixMatch = (usedPrefix = (match[0] || '')[0]);
        if (hasPrefixMatch || plugin.noPrefix) {
          if (!hasPrefixMatch) usedPrefix = '';
          let noPrefix = hasPrefixMatch ? m.text.replace(usedPrefix, '') : m.text;
          let [command, ...args] = noPrefix.trim().split` `.filter((v) => v);
          args = args || [];
          let _args = noPrefix.trim().split` `.slice(1);
          let text = _args.join` `;
          command = (command || '').toLowerCase();
          let fail = plugin.fail || global.dfail; // When failed
          let isAccept =
            plugin.command instanceof RegExp // RegExp Mode?
              ? plugin.command.test(command)
              : Array.isArray(plugin.command) // Array?
                ? plugin.command.some((cmd) =>
                    cmd instanceof RegExp // RegExp in Array?
                      ? cmd.test(command)
                      : cmd === command
                  )
                : typeof plugin.command === 'string' // String?
                  ? plugin.command === command
                  : false;
          if (!isAccept && Array.isArray(plugin.hidden)) isAccept = plugin.hidden.includes(command);

          if (!isAccept) continue;
          m.plugin = name;
          if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
            let chat = global.db.data.chats[m.chat];
            let user = global.db.data.users[m.sender];
            if (name != 'group-modebot.js' && name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && (chat?.isBanned || chat?.mute)) return;
            if (name != 'unbanchat.js' && chat && chat.isBanned) return; // Except this
            if (name != 'unbanuser.js' && user && user.banned) return;
            if (m.isGroup) {
              chat.memgc[m.sender].command++;
              chat.memgc[m.sender].commandTotal++;
              chat.memgc[m.sender].lastCmd = Date.now();
            }
            user.command++;
            user.commandTotal++;
            user.lastCmd = Date.now();
          }

          if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
            // Both Owner
            fail('owner', m, this);
            continue;
          }
          if (plugin.rowner && !isROwner) {
            // Real Owner
            fail('rowner', m, this);
            continue;
          }
          if (plugin.owner && !isOwner) {
            // Number Owner
            fail('owner', m, this);
            continue;
          }
          if (plugin.mods && !isMods) {
            // Moderator
            fail('mods', m, this);
            continue;
          }
          if (plugin.premium && !isPrems) {
            // Premium
            fail('premium', m, this);
            continue;
          }
          if (plugin.group && !m.isGroup) {
            // Group Only
            fail('group', m, this);
            continue;
          } else if (plugin.botAdmin && !isBotAdmin) {
            // You Admin
            fail('botAdmin', m, this);
            continue;
          } else if (plugin.admin && !isAdmin) {
            // User Admin
            fail('admin', m, this);
            continue;
          }
          if (plugin.private && m.isGroup) {
            // Private Chat Only
            fail('private', m, this);
            continue;
          }
          if (plugin.register == true && _user.registered == false) {
            // Butuh daftar?
            fail('unreg', m, this);
            continue;
          }
          if (plugin.rpg && !global.db.data.chats[m.chat].rpg) {
            // rpg
            fail('rpg', m, this);
            continue;
          }
          if (plugin.nsfw && !global.db.data.chats[m.chat].nsfw) {
            // nsfw
            fail('nsfw', m, this);
            continue;
          }
          m.isCommand = true;
          let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17; // XP Earning per command
          if (xp > 200)
            m.reply('Ngecit -_-'); // Hehehe
          else m.exp += xp;
          if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
            this.reply(m.chat, `Limit anda habis, silahkan beli melalui *${usedPrefix}buy* atau beli di *${usedPrefix}shop*`, m);
            continue; // Limit habis
          }
          if (plugin.level > _user.level) {
            this.reply(m.chat, `diperlukan level ${plugin.level} untuk menggunakan perintah ini. Level kamu ${_user.level}\m gunakan .levelup untuk menaikan level!`, m);
            continue; // If the level has not been reached
          }
          let extra = {
            match,
            usedPrefix,
            noPrefix,
            _args,
            args,
            command,
            text,
            conn: this,
            Api,
            participants,
            groupMetadata,
            user,
            bot,
            isROwner,
            isOwner,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate
          };
          try {
            if (plugin.wait) await m.reply(global.config.messages.wait);
            await run.call(this, m, extra);
            if (!isPrems) m.limit = m.limit || plugin.limit || false;
          } catch (e) {
            // Error occured
            m.error = e;
            console.error(e);
            if (e) {
              // Detailed text (may include a stack trace) — for the server log / owner
              // notification below only. Never reply this to the chat: a native Error's
              // stack can leak server file paths, and any credential not covered by
              // APIKeys would go out unredacted.
              let text = util.format(e);
              for (let key of Object.values(APIKeys)) text = text.replace(new RegExp(key, 'g'), '#HIDDEN#');
              if (e.name)
                for (let jid of owner.map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter((v) => v != this.user.jid)) {
                  let data = (await this.onWhatsApp(jid))[0] || {};
                  if (data.exists)
                    //m.reply(`*Plugin:* ${m.plugin}\n*Sender:* @${m.sender.split`@`[0]}\n*Chat:* ${m.chat}\n*Chat Name:* ${await this.getName(m.chat)}\n*Command:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\``.trim(), data.jid, { mentions: [m.sender] })
                    console.error(`Plugin:${m.plugin} | Sender:@${m.sender.split('@')[0]} | Chat:${m.chat} | ChatName:${await this.getName(m.chat)} | Command:${usedPrefix}${command} ${args.join(' ')} | Error:${text}`);
                }
              // User-facing reply: a plugin's own `throw 'message'` (string) is an
              // intentional validation message, safe to show as-is. Anything else
              // (a native Error, thrown object, etc.) is unexpected — show a generic
              // message instead of the raw error/stack.
              m.reply(typeof e === 'string' ? e : global.config.messages.error || 'Error');
            }
          } finally {
            // m.reply(util.format(_user))
            if (typeof plugin.after === 'function') {
              try {
                await plugin.after.call(this, m, extra);
              } catch (e) {
                console.error(e);
              }
            }
            if (m.limit) m.reply(+m.limit + ' Limit terpakai');
          }
          break;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      //conn.sendPresenceUpdate('composing', m.chat) // kalo pengen auto vn hapus // di baris dekat conn
      //console.log(global.db.data.users[m.sender])
      let user,
        stats = global.db.data.stats;
      if (m) {
        if (m.sender && (user = global.db.data.users[m.sender])) {
          user.exp += m.exp;
          user.limit -= m.limit * 1;
        }

        let stat;
        if (m.plugin) {
          let now = +new Date();
          if (m.plugin in stats) {
            stat = stats[m.plugin];
            if (!isNumber(stat.total)) stat.total = 1;
            if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1;
            if (!isNumber(stat.last)) stat.last = now;
            if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now;
          } else
            stat = stats[m.plugin] = {
              total: 1,
              success: m.error != null ? 0 : 1,
              last: now,
              lastSuccess: m.error != null ? 0 : now
            };
          stat.total += 1;
          stat.last = now;
          if (m.error == null) {
            stat.success += 1;
            stat.lastSuccess = now;
          }
        }
      }

      try {
        await print(m, this);
      } catch (e) {
        // console.log(m, m.quoted, e)
      }
      if (opts['autoread'] && m.key?.id) await this.sendReadReceipt(m.chat, m.key.participant || m.sender, [m.key.id]);
    }
  },

  async participantsUpdate({ id, participants, action }) {
    if (opts['self']) return;
    if (global.isInit) return;

    let chat = db.data.chats[id] || {};
    let text = '';

    switch (action) {
      case 'add':
      case 'remove':
      case 'leave':
      case 'invite':
      case 'invite_v4':
        if (chat.welcome) {
          let groupMetadata = await this.groupMetadata(id).catch(() => null);
          if (!groupMetadata) break;

          for (let user of participants) {
            let jid = user;
            if (typeof user === 'object') {
              jid = user.phoneNumber || user.id || user.jid || user;
            }
            if (!jid || (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid'))) continue;
            if (String(jid).endsWith('@lid')) {
              jid = await resolveLidJid(this, jid);
              if (String(jid).endsWith('@lid')) continue;
            }

            const isAdd = ['add', 'invite', 'invite_v4'].includes(action);

            text = (isAdd ? chat.sWelcome || this.welcome || 'Selamat datang @user 👋' : chat.sBye || this.bye || 'Selamat tinggal @user 👋')
              .replace('@subject', groupMetadata.subject || 'Group')
              .replace('@desc', groupMetadata.desc?.toString() || '')
              .replace('@user', '@' + jid.split('@')[0]);

            await this.sendMessage(id, {
              text,
              mentions: [jid]
            });
          }
        }
        break;
      case 'promote':
        text = chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```';
      case 'demote':
        if (!text) text = chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```';
        let jid = participants[0];
        if (typeof jid === 'object') {
          jid = jid.phoneNumber || jid.id || jid.jid || jid;
        }
        if (String(jid).endsWith('@lid')) {
          jid = await resolveLidJid(this, jid);
          if (String(jid).endsWith('@lid')) break;
        }
        text = text.replace('@user', '@' + jid.split('@')[0]);
        if (chat.detect) await this.sendMessage(id, { text, mentions: [jid] });
        break;
    }
  },
  async delete({ remoteJid, fromMe, id, participant }) {
    if (fromMe) return;
    const _now = Date.now();
    this._delCache = this._delCache || new Map();
    if (id && this._delCache.get(id) > _now - 5000) return;
    if (id) this._delCache.set(id, _now);
    if (this._delCache.size > 200) {
      for (const [k, v] of this._delCache) if (v <= _now - 5000) this._delCache.delete(k);
    }
    let chats = Object.entries(this.chats).find(([user, data]) => data.messages && data.messages[id]);

    // Find chat settings
    let chat = global.db.data.chats[remoteJid] || {};
    if (!chat.delete) return; // anti-delete is disabled when chat.delete is false

    let msg = chats ? chats[1].messages[id] : null;

    let participantJid = String(participant || '');
    if (participantJid.endsWith('@lid')) {
      participantJid = await resolveLidJid(this, participantJid);
    }
    const mentionSafe = !!participantJid && participantJid.endsWith('@s.whatsapp.net');
    const label = mentionSafe ? participantJid.split('@')[0] : 'user';
    const mentionList = mentionSafe ? [participantJid] : [];

    if (msg) {
      await this.reply(
        remoteJid,
        `
Terdeteksi @${label} telah menghapus pesan
Untuk mematikan fitur ini, ketik
*.disable delete*
`.trim(),
        msg,
        {
          mentions: mentionList
        }
      );
      this.copyNForward(remoteJid, msg).catch((e) => console.error(e, msg));
    } else {
      await this.sendMessage(remoteJid, {
        text: `Terdeteksi @${label} telah menghapus pesan\n\nUntuk mematikan fitur ini, ketik\n*.disable delete*`,
        mentions: mentionList
      });
    }
  }
};

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: 'Perintah ini hanya dapat digunakan oleh _*OWWNER!1!1!*_',
    owner: 'Perintah ini hanya dapat digunakan oleh _*Owner Bot*_!',
    mods: 'Perintah ini hanya dapat digunakan oleh _*Moderator*_ !',
    rpg: 'Fitur RPG Dimatikan Oleh Admin\n\n> ketik *.enable rpg* agar dapat akses fitur rpg',
    nsfw: 'Fitur NSFW Dimatikan Oleh Admin\n\n> ketik *.enable nsfw* agar dapat akses fitur NSFW',
    premium: 'Perintah ini hanya untuk member _*Premium*_ !',
    group: 'Perintah ini hanya dapat digunakan di grup!',
    private: 'Perintah ini hanya dapat digunakan di Chat Pribadi!',
    admin: 'Perintah ini hanya untuk *Admin* grup!',
    botAdmin: 'Jadikan bot sebagai *Admin* untuk menggunakan perintah ini!',
    unreg: 'Silahkan daftar untuk menggunakan fitur ini dengan cara mengetik:\n\n*#daftar nama.umur*\n\nContoh: *#daftar Mansur.16*',
    restrict: 'Fitur ini di *disable*!'
  }[type];
  if (msg) return m.reply(msg);
};

import fs from 'fs';
import chalk from 'chalk';
let file = import.meta.filename;
fs.unwatchFile(file);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'handler.js'"));
  if (global.reloadHandler) global.reloadHandler();
});
