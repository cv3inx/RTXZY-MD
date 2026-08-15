// Pemilihan adapter database untuk lowdb.
// Prioritas: argumen `--db` menang atas `config.database.type`.
// Tipe yang didukung: 'sqlite' (default), 'json', 'mongodb', dan URL http(s)
// untuk cloud adapter.
import fs from 'fs';
import path from 'path';
import { JSONFile } from 'lowdb';
import SQLiteAdapter from './sqliteDB.js';
import mongoDB from './mongoDB.js';
import cloudDBAdapter from './cloudDBAdapter.js';

const DB_DIR = 'database';

/**
 * Tentukan adapter mana yang dipakai. Pure — tidak membuka file, folder, atau
 * koneksi apa pun, jadi bisa diuji tanpa menyalakan bot.
 * @param {object} opts hasil parse yargs (`global.opts`)
 * @param {object} config isi `global.config`
 * @returns {{kind: 'sqlite'|'json'|'mongodb'|'cloud', jsonPath: string, legacyJsonPath: string, sqlitePath: string, target: string}}
 */
export function resolveDb(opts = {}, config = {}) {
  const prefix = opts._?.[0] ? `${opts._[0]}_` : '';
  const jsonPath = path.join(DB_DIR, `${prefix}database.json`);
  const sqlitePath = path.join(DB_DIR, `${prefix}database.sqlite`);
  // Lokasi lama sebelum semua file database dipindah ke folder `database/`.
  const legacyJsonPath = `${prefix}database.json`;
  const paths = { jsonPath, legacyJsonPath, sqlitePath };

  const cli = String(opts.db ?? '').trim();
  const type = String(config.database?.type ?? 'sqlite')
    .trim()
    .toLowerCase();
  const target = cli || (type === 'mongodb' ? String(config.database?.mongoUrl ?? '').trim() : type);

  if (/^https?:\/\//i.test(target)) return { kind: 'cloud', target, ...paths };
  if (/^mongodb(\+srv)?:\/\//i.test(target)) return { kind: 'mongodb', target, ...paths };
  if (!cli && type === 'mongodb' && !target) {
    throw new Error("config.database.type = 'mongodb' tapi config.database.mongoUrl masih kosong");
  }
  if (target === 'json') return { kind: 'json', target: jsonPath, ...paths };
  if (target === 'sqlite' || target === '') return { kind: 'sqlite', target: sqlitePath, ...paths };
  throw new Error(`Tipe database '${target}' tidak dikenal. Pakai 'sqlite', 'json', 'mongodb', atau URL http(s).`);
}

/** Bangun adapter lowdb sesuai hasil resolveDb(). */
export function createAdapter(opts = {}, config = {}) {
  const resolved = resolveDb(opts, config);
  switch (resolved.kind) {
    case 'cloud':
      return new cloudDBAdapter(resolved.target);
    case 'mongodb':
      return new mongoDB(resolved.target);
    case 'json':
      fs.mkdirSync(DB_DIR, { recursive: true });
      // Pindahkan sekali data dari lokasi lama di root supaya tidak terlihat
      // seperti database kosong setelah upgrade.
      if (!fs.existsSync(resolved.jsonPath) && fs.existsSync(resolved.legacyJsonPath)) {
        fs.copyFileSync(resolved.legacyJsonPath, resolved.jsonPath);
      }
      return new JSONFile(resolved.jsonPath);
    default:
      fs.mkdirSync(DB_DIR, { recursive: true });
      // Kedua path JSON dilempar ke adapter supaya database lama diimpor sekali
      // saat tabel kv masih kosong — yang ada duluan yang dipakai.
      return new SQLiteAdapter(resolved.sqlitePath, [resolved.jsonPath, resolved.legacyJsonPath]);
  }
}

export default createAdapter;

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((m) => m.default);
  const kind = (opts, config) => resolveDb(opts, config).kind;

  assert.strictEqual(kind({}, {}), 'sqlite', 'sqlite adalah default');
  assert.strictEqual(kind({}, { database: { type: 'SQLite' } }), 'sqlite');
  assert.strictEqual(kind({}, { database: { type: 'json' } }), 'json');
  assert.strictEqual(kind({}, { database: { type: 'mongodb', mongoUrl: 'mongodb://user:pass@host:27017/bot' } }), 'mongodb');

  // --db menang atas config
  assert.strictEqual(kind({ db: 'json' }, { database: { type: 'sqlite' } }), 'json');
  assert.strictEqual(kind({ db: 'sqlite' }, { database: { type: 'json' } }), 'sqlite');
  assert.strictEqual(kind({ db: 'https://host.dev/db.json' }, { database: { type: 'json' } }), 'cloud');
  assert.strictEqual(kind({ db: 'mongodb+srv://a/b' }, {}), 'mongodb');

  // Salah konfigurasi harus berisik, bukan diam-diam jatuh ke sqlite
  assert.throws(() => resolveDb({}, { database: { type: 'mongodb' } }), /mongoUrl/);
  assert.throws(() => resolveDb({}, { database: { type: 'postgres' } }), /tidak dikenal/);

  // Semua file database tinggal di folder `database/`
  const paths = resolveDb({}, {});
  assert.strictEqual(paths.sqlitePath, path.join('database', 'database.sqlite'));
  assert.strictEqual(paths.jsonPath, path.join('database', 'database.json'));
  assert.strictEqual(paths.legacyJsonPath, 'database.json');

  // Argumen posisional jadi prefix nama file (multi-bot satu folder)
  const multi = resolveDb({ _: ['bot2'] }, {});
  assert.strictEqual(multi.sqlitePath, path.join('database', 'bot2_database.sqlite'));
  assert.strictEqual(multi.jsonPath, path.join('database', 'bot2_database.json'));
  assert.strictEqual(multi.legacyJsonPath, 'bot2_database.json');

  console.log('adapter.js self-check OK');
}
