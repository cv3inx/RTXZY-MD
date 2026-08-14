import './config.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import yargs from 'yargs/yargs';
import cp from 'child_process';
import _ from 'lodash';
import syntaxerror from 'syntax-error';
import { buildPrefixRegex } from './lib/simple.js';
import mongoDB from './lib/database/mongoDB.js';
import cloudDBAdapter from './lib/database/cloudDBAdapter.js';
import readline from 'readline';
import { createClient, authenticate, connectionUpdate, makeSocket } from './lib/system/connection.js';
import { pathToFileURL, fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

let low;
try {
  low = await import('lowdb');
} catch (e) {
  low = await import('./lib/lowdb.js');
}
const { Low, JSONFile } = low;

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const question = (text) => new Promise((resolve) => rl.question(text, resolve));

  global.API = (name, path = '/', query = {}, apikeyqueryname) =>
    (name in global.config.api ? global.config.api[name].url : name) +
    path +
    (query || apikeyqueryname
      ? '?' +
        new URLSearchParams(
          Object.entries({
            ...query,
            ...(apikeyqueryname
              ? {
                  [apikeyqueryname]: name in global.config.api ? global.config.api[name].key : undefined
                }
              : {})
          })
        )
      : '');
  global.timestamp = {
    start: new Date()
  };

  global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  global.prefix = buildPrefixRegex(opts['prefix'] || global.config.prefix);

  global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ? new mongoDB(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));
  global.DATABASE = global.db;
  global.loadDatabase = async function loadDatabase() {
    if (global.db.READ)
      return new Promise((resolve) =>
        setInterval(function () {
          !global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null;
        }, 1 * 1000)
      );
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read();
    global.db.READ = false;
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      ...(global.db.data || {})
    };
    global.db.chain = _.chain(global.db.data);
  };
  loadDatabase();

  const authFile = `${opts._[0] || 'sessions'}`;
  global.isInit = !fs.existsSync(authFile);
  const { conn, connectionOptions, saveCreds } = await createClient(authFile);
  global.conn = conn;

  if (!opts['test']) {
    if (global.db)
      setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (!opts['tmp'] && (global.support || {}).find) {
          let tmp = [os.tmpdir(), 'tmp'];
          tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
        }
      }, 30 * 1000);
  }

  await authenticate(conn, { rl, question });

  process.on('uncaughtException', console.error);

  const imports = async (filePath) => {
    const resolvedPath = path.resolve(filePath);
    const module = await import(pathToFileURL(resolvedPath).href + '?update=' + Date.now());
    return module.default || module;
  };
  let isInit = true;
  global.reloadHandler = async function (restatConn) {
    let handler = await imports('./handler.js');
    if (restatConn) {
      try {
        global.conn.ws.close();
      } catch {}
      global.conn = {
        ...global.conn,
        ...makeSocket(connectionOptions)
      };
    }
    if (!isInit) {
      conn.ev.off('messages.upsert', conn.handler);
      conn.ev.off('group-participants.update', conn.participantsUpdate);
      conn.ev.off('message.delete', conn.onDelete);
      conn.ev.off('connection.update', conn.connectionUpdate);
      conn.ev.off('creds.update', conn.credsUpdate);
    }

    conn.welcome = 'Selamat datang @user di group @subject utamakan baca desk ya \n@desc';
    conn.bye = 'Selamat tinggal @user 👋';
    conn.promote = '@user sekarang admin!';
    conn.demote = '@user sekarang bukan admin!';
    conn.handler = handler.handler.bind(conn);
    conn.participantsUpdate = handler.participantsUpdate.bind(conn);
    conn.onDelete = handler.delete.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    conn.credsUpdate = saveCreds.bind(conn);

    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('group-participants.update', conn.participantsUpdate);
    conn.ev.on('message.delete', conn.onDelete);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    isInit = false;
    return true;
  };

  let pluginFolder = path.join(__dirname, 'plugins');
  let pluginFilter = (filename) => /\.js$/.test(filename);
  const listPluginFiles = (dir, base = dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? listPluginFiles(path.join(dir, entry.name), base) : pluginFilter(entry.name) ? [path.relative(base, path.join(dir, entry.name))] : []));
  global.plugins = {};
  for (let filename of listPluginFiles(pluginFolder)) {
    try {
      const module = await import(pathToFileURL(path.join(pluginFolder, filename)).href + '?update=' + Date.now());
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
  console.log(Object.keys(global.plugins));
  global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
      let dir = path.join(pluginFolder, filename);
      if (fs.existsSync(dir)) {
        conn.logger.info(`reloading plugin '${filename}'`);
      } else {
        conn.logger.warn(`deleted plugin '${filename}'`);
        return delete global.plugins[filename];
      }
      let err = syntaxerror(fs.readFileSync(dir), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
      });
      if (err) conn.logger.error(`syntax error while loading '${filename}'\n${err}`);
      else
        try {
          const module = await import(pathToFileURL(dir).href + '?update=' + Date.now());
          global.plugins[filename] = module.default || module;
        } catch (e) {
          conn.logger.error(e);
        } finally {
          global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
        }
    }
  };
  Object.freeze(global.reload);
  fs.watch(path.join(__dirname, 'plugins'), { recursive: true }, global.reload);
  await global.reloadHandler();

  // Quick Test
  async function _quickTest() {
    let test = await Promise.all(
      [cp.spawn('ffmpeg'), cp.spawn('ffprobe'), cp.spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']), cp.spawn('convert'), cp.spawn('magick'), cp.spawn('gm'), cp.spawn('find', ['--version'])].map((p) => {
        return Promise.race([
          new Promise((resolve) => {
            p.on('close', (code) => {
              resolve(code !== 127);
            });
          }),
          new Promise((resolve) => {
            p.on('error', (_) => resolve(false));
          })
        ]);
      })
    );
    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    console.log(test);
    let s = (global.support = {
      ffmpeg,
      ffprobe,
      ffmpegWebp,
      convert,
      magick,
      gm,
      find
    });
    Object.freeze(global.support);

    if (!s.ffmpeg) conn.logger.warn('Please install ffmpeg for sending videos (pkg install ffmpeg)');
    if (s.ffmpeg && !s.ffmpegWebp) conn.logger.warn('Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)');
    if (!s.convert && !s.magick && !s.gm) conn.logger.warn('Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)');
  }

  _quickTest()
    .then(() => conn.logger.info('Quick Test Done'))
    .catch('done');
})();
