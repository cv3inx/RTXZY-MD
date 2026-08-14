import syntaxerror from 'syntax-error';
import util from 'util';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const handler = {
  help: ['> ', '=> '],
  tags: ['advanced'],
  customPrefix: /^=?> /,
  command: /(?:)/i,
  owner: true,
  rowner: true,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, _2) => {
    let { conn, usedPrefix, noPrefix, args, groupMetadata } = _2;
    let _return;
    let _syntax = '';
    let _text = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix;
    let old = m.exp * 1;
    try {
      let i = 15;
      let f = {
        exports: {}
      };
      let exec = new (async () => {}).constructor('print', 'm', 'handler', 'require', 'conn', 'Array', 'process', 'args', 'groupMetadata', 'module', 'exports', 'argument', _text);
      _return = await exec.call(
        conn,
        (...args) => {
          if (--i < 1) return;
          console.log(...args);
          return conn.reply(m.chat, util.format(...args), m);
        },
        m,
        handler,
        require,
        conn,
        CustomArray,
        process,
        args,
        groupMetadata,
        f,
        f.exports,
        [conn, _2]
      );
    } catch (e) {
      let err = await syntaxerror(_text, 'Execution Function', {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true
      });
      if (err) _syntax = '```' + err + '```\n\n';
      _return = e;
    } finally {
      conn.reply(m.chat, _syntax + util.format(_return), m);
      m.exp = old;
    }
  }
};

export default handler;

class CustomArray extends Array {
  constructor(...args) {
    if (typeof args[0] == 'number') return super(Math.min(args[0], 10000));
    else return super(...args);
  }
}
