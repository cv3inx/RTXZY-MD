import './config.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import yargs from 'yargs/yargs';
import cp from 'child_process';
import _ from 'lodash';
import syntaxerror from 'syntax-error';
import { buildPrefixRegex } from './lib/simple.js';
import { createAdapter, resolveDb } from './lib/database/adapter.js';
import readline from 'readline';
import { createClient, authenticate, connectionUpdate, makeSocket } from './lib/system/connection.js';
import log from './lib/system/log.js';
import { pathToFileURL, fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

const { Low } = await import('lowdb');

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

  global.db = new Low(createAdapter(global.opts, global.config));
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
  const { conn: initialConn, connectionOptions } = await createClient(authFile);
  global.conn = initialConn;

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

  // `conn` below is deliberately not a local binding - it resolves to
  // global.conn (bare identifiers reach the global object in this codebase),
  // so it keeps working after reloadHandler swaps global.conn on reconnect.
  global.conn = await authenticate(conn, { rl, question });

  process.on('uncaughtException', console.error);

  const imports = async (filePath) => {
    const resolvedPath = path.resolve(filePath);
    const module = await import(pathToFileURL(resolvedPath).href + '?update=' + Date.now());
    return module.default || module;
  };
  let isInit = true;
  global.reloadHandler = async function (restatConn) {
    let handler = await imports('./handler.js');
    const oldConn = global.conn;
    if (restatConn) {
      try {
        oldConn.ws.close();
      } catch {}
      global.conn = makeSocket(connectionOptions);
    }
    if (!isInit) {
      oldConn.ev.off('messages.upsert', oldConn.handler);
      oldConn.ev.off('group-participants.update', oldConn.participantsUpdate);
      oldConn.ev.off('message.delete', oldConn.onDelete);
      oldConn.ev.off('connection.update', oldConn.connectionUpdate);
    }

    conn.welcome = 'Selamat datang @user di group @subject utamakan baca desk ya \n@desc';
    conn.bye = 'Selamat tinggal @user 👋';
    conn.promote = '@user sekarang admin!';
    conn.demote = '@user sekarang bukan admin!';
    conn.handler = handler.handler.bind(conn);
    conn.participantsUpdate = handler.participantsUpdate.bind(conn);
    conn.onDelete = handler.delete.bind(conn);
    conn.connectionUpdate = connectionUpdate.bind(conn);
    // Tidak ada listener 'creds.update': zapo-js menyimpan kredensial ke store
    // sendiri. connection.js tetap meng-emit event-nya untuk plugin yang mau
    // tahu kapan pairing selesai.

    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('group-participants.update', conn.participantsUpdate);
    conn.ev.on('message.delete', conn.onDelete);
    conn.ev.on('connection.update', conn.connectionUpdate);
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
      log.error(`Plugin '${filename}' gagal dimuat`);
      log.detail(String(e?.stack || e).split('\n')[0]);
      delete global.plugins[filename];
    }
  }
  // Ditunggu di sini, bukan di akhir: hasilnya bagian dari ringkasan boot, dan
  // kalau dibiarkan berjalan sendiri barisnya muncul setelah "Tersambung".
  await _quickTest().catch((err) => {
    log.error('Pengecekan tool media gagal');
    log.detail(String(err?.message || err));
  });

  const pluginCount = Object.keys(global.plugins).length;
  const failed = listPluginFiles(pluginFolder).length - pluginCount;
  const tools = Object.values(global.support || {});
  log.field('Plugin', `${pluginCount} dimuat${failed > 0 ? ` · ${failed} gagal` : ''}`);
  if (tools.length) log.field('Media', `${tools.filter(Boolean).length}/${tools.length} tool tersedia`);
  log.field('Database', resolveDb(global.opts, global.config).kind);
  log.field('Prefix', (global.config.prefix || []).join(' '));
  log.field('Login', global.useQR ? 'QR code' : 'Pairing code');

  global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
      let dir = path.join(pluginFolder, filename);
      if (fs.existsSync(dir)) {
        log.reload(filename);
      } else {
        log.warn(`Plugin dihapus: ${filename}`);
        return delete global.plugins[filename];
      }
      let err = syntaxerror(fs.readFileSync(dir), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
      });
      if (err) {
        log.error(`Syntax error di '${filename}', versi lama tetap dipakai`);
        log.detail(String(err).split('\n')[0]);
      } else
        try {
          const module = await import(pathToFileURL(dir).href + '?update=' + Date.now());
          global.plugins[filename] = module.default || module;
        } catch (e) {
          log.error(`Gagal reload '${filename}'`);
          log.detail(String(e?.stack || e).split('\n')[0]);
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

    if (!s.ffmpeg) log.warn('ffmpeg tidak ada — pengiriman video akan gagal');
    if (s.ffmpeg && !s.ffmpegWebp) log.warn('ffmpeg tanpa libwebp — stiker animasi tidak jalan');
    if (!s.convert && !s.magick && !s.gm) log.warn('imagemagick tidak ada — stiker bisa gagal kalau ffmpeg juga tanpa libwebp');
  }
})();
