// Pemilihan adapter database untuk lowdb.
// Prioritas: argumen `--db` menang atas `config.database.type`.
// Tipe yang didukung: 'sqlite' (default), 'postgres', 'mongodb', dan URL
// http(s) untuk cloud adapter.
import fs from 'fs';
import path from 'path';
import SQLiteAdapter from './sqliteDB.js';
import PostgresAdapter from './postgresDB.js';
import mongoDB from './mongoDB.js';
import cloudDBAdapter from './cloudDBAdapter.js';

const DB_DIR = 'database';

// Tipe yang datanya ada di tempat lain, jadi butuh config.database.url.
const REMOTE_TYPES = new Set(['postgres', 'postgresql', 'mongodb', 'mongo', 'cloud']);

/**
 * Tentukan adapter mana yang dipakai. Pure — tidak membuka file, folder, atau
 * koneksi apa pun, jadi bisa diuji tanpa menyalakan bot.
 * @param {object} opts hasil parse yargs (`global.opts`)
 * @param {object} config isi `global.config`
 * @returns {{kind: 'sqlite'|'postgres'|'mongodb'|'cloud', jsonPath: string, legacyJsonPath: string, sqlitePath: string, pgTable: string, target: string}}
 */
export function resolveDb(opts = {}, config = {}) {
  const prefix = opts._?.[0] ? `${opts._[0]}_` : '';
  const jsonPath = path.join(DB_DIR, `${prefix}database.json`);
  const sqlitePath = path.join(DB_DIR, `${prefix}database.sqlite`);
  // Lokasi lama sebelum semua file database dipindah ke folder `database/`.
  const legacyJsonPath = `${prefix}database.json`;
  const paths = { jsonPath, legacyJsonPath, sqlitePath, pgTable: `${prefix}bot_data` };

  // Urutan menang: `--db` > `config.database.url` > `config.database.type`.
  const cli = String(opts.db ?? '').trim();
  const url = String(config.database?.url ?? '').trim();
  const picked = cli || url || String(config.database?.type ?? 'sqlite').trim();

  // Nama tipe ('postgres') cuma penunjuk — URL sebenarnya selalu diambil dari
  // config.database.url. URL punya ':' jadi tidak lolos tes huruf-saja ini, dan
  // tidak pernah di-lowercase karena password di dalamnya case-sensitive.
  const type = /^[a-z]+$/i.test(picked) ? picked.toLowerCase() : '';

  // Salah konfigurasi harus berisik, bukan diam-diam jatuh ke sqlite.
  if (REMOTE_TYPES.has(type) && !url) throw new Error(`Database '${type}' butuh config.database.url, tapi masih kosong`);
  const target = REMOTE_TYPES.has(type) ? url : type || picked;

  if (/^https?:\/\//i.test(target)) return { kind: 'cloud', target, ...paths };
  if (/^mongodb(\+srv)?:\/\//i.test(target)) return { kind: 'mongodb', target, ...paths };
  if (/^postgres(ql)?:\/\//i.test(target)) return { kind: 'postgres', target, ...paths };
  if (target === 'sqlite' || target === '') return { kind: 'sqlite', target: sqlitePath, ...paths };
  throw new Error(`Tipe database '${target}' tidak dikenal. Pakai 'sqlite', 'postgres', 'mongodb', atau URL http(s).`);
}

/** Bangun adapter lowdb sesuai hasil resolveDb(). */
export function createAdapter(opts = {}, config = {}) {
  const resolved = resolveDb(opts, config);
  switch (resolved.kind) {
    case 'cloud':
      return new cloudDBAdapter(resolved.target);
    case 'mongodb':
      return new mongoDB(resolved.target);
    case 'postgres':
      return new PostgresAdapter(resolved.target, resolved.pgTable);
    default:
      fs.mkdirSync(DB_DIR, { recursive: true });
      // Kedua path JSON dilempar ke adapter supaya database lama diimpor sekali
      // saat tabel kv masih kosong — yang ada duluan yang dipakai.
      return new SQLiteAdapter(resolved.sqlitePath, [resolved.jsonPath, resolved.legacyJsonPath]);
  }
}

/**
 * Simpan database lalu tutup adapternya. Dipakai saat bot berhenti: penulisan
 * rutin hanya tiap 30 detik, jadi tanpa ini setiap stop membuang perubahan
 * terakhir. close() juga men-checkpoint WAL sqlite supaya file -wal tidak
 * tumbuh tanpa batas.
 *
 * Tidak melempar: yang memanggil sedang keluar, dan gagal menutup tidak boleh
 * menghalangi proses berhenti.
 * @returns {Promise<Error|null>} error kalau ada, null kalau bersih
 */
export async function flushAndClose(db) {
  try {
    if (db?.data) await db.write();
    await db?.adapter?.close?.();
    return null;
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
}

export default createAdapter;

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((m) => m.default);
  const kind = (opts, config) => resolveDb(opts, config).kind;

  assert.strictEqual(kind({}, {}), 'sqlite', 'sqlite adalah default');
  assert.strictEqual(kind({}, { database: { type: 'SQLite' } }), 'sqlite');

  // Satu field `url` untuk semua: tipenya dideteksi dari skema URL-nya
  assert.strictEqual(kind({}, { database: { url: 'postgres://user:pass@host:5432/bot' } }), 'postgres');
  assert.strictEqual(kind({}, { database: { url: 'postgresql://user:pass@host:5432/bot' } }), 'postgres');
  assert.strictEqual(kind({}, { database: { url: 'mongodb://user:pass@host:27017/bot' } }), 'mongodb');
  assert.strictEqual(kind({}, { database: { url: 'mongodb+srv://a/b' } }), 'mongodb');
  assert.strictEqual(kind({}, { database: { url: 'https://host.dev/db.json' } }), 'cloud');
  assert.strictEqual(kind({}, { database: { url: 'sqlite' } }), 'sqlite', 'nama tipe di `url` juga sah');

  // `url` menang atas `type` — mengisi url tidak perlu ikut mengubah type
  assert.strictEqual(kind({}, { database: { type: 'sqlite', url: 'postgres://a/b' } }), 'postgres');
  // ...dan `type` tetap bisa dipakai sebagai penunjuk ke url yang sama
  assert.strictEqual(kind({}, { database: { type: 'postgres', url: 'postgres://a/b' } }), 'postgres');

  // --db menang atas keduanya
  assert.strictEqual(kind({ db: 'sqlite' }, { database: { url: 'postgres://a/b' } }), 'sqlite');
  assert.strictEqual(kind({ db: 'postgres' }, { database: { type: 'sqlite', url: 'postgres://a/b' } }), 'postgres', 'nama tipe di --db ikut pakai url dari config');
  assert.strictEqual(kind({ db: 'postgres://a/b' }, { database: { type: 'sqlite' } }), 'postgres');
  assert.strictEqual(kind({ db: 'https://host.dev/db.json' }, {}), 'cloud');
  assert.strictEqual(kind({ db: 'mongodb+srv://a/b' }, {}), 'mongodb');

  // URL dipakai apa adanya: password case-sensitive
  assert.strictEqual(resolveDb({ db: 'postgres://User:PaSs@Host:5432/DB' }, {}).target, 'postgres://User:PaSs@Host:5432/DB');
  assert.strictEqual(resolveDb({}, { database: { url: 'postgres://User:PaSs@Host/DB' } }).target, 'postgres://User:PaSs@Host/DB');

  // Salah konfigurasi harus berisik, bukan diam-diam jatuh ke sqlite
  assert.throws(() => resolveDb({}, { database: { type: 'mongodb' } }), /butuh config\.database\.url/);
  assert.throws(() => resolveDb({}, { database: { type: 'postgres' } }), /butuh config\.database\.url/);
  assert.throws(() => resolveDb({ db: 'postgres' }, {}), /butuh config\.database\.url/);
  assert.throws(() => resolveDb({}, { database: { type: 'json' } }), /tidak dikenal/, 'tipe json sudah dihapus');
  assert.throws(() => resolveDb({ db: 'json' }, {}), /tidak dikenal/);
  assert.throws(() => resolveDb({}, { database: { url: 'mysql://a/b' } }), /tidak dikenal/);

  // Semua file database tinggal di folder `database/`
  const paths = resolveDb({}, {});
  assert.strictEqual(paths.sqlitePath, path.join('database', 'database.sqlite'));
  assert.strictEqual(paths.jsonPath, path.join('database', 'database.json'));
  assert.strictEqual(paths.legacyJsonPath, 'database.json');
  assert.strictEqual(paths.pgTable, 'bot_data');

  // Argumen posisional jadi prefix nama file & nama tabel (multi-bot satu tempat)
  const multi = resolveDb({ _: ['bot2'] }, {});
  assert.strictEqual(multi.sqlitePath, path.join('database', 'bot2_database.sqlite'));
  assert.strictEqual(multi.jsonPath, path.join('database', 'bot2_database.json'));
  assert.strictEqual(multi.legacyJsonPath, 'bot2_database.json');
  assert.strictEqual(multi.pgTable, 'bot2_bot_data');

  // flushAndClose: tulis dulu, tutup kemudian, dan jangan pernah melempar
  const calls = [];
  const fake = (over = {}) => ({ data: { users: {} }, write: async () => calls.push('write'), adapter: { close: async () => calls.push('close') }, ...over });

  assert.strictEqual(await flushAndClose(fake()), null);
  assert.deepStrictEqual(calls, ['write', 'close'], 'urutan harus tulis lalu tutup');

  // Database yang belum sempat dibaca (data null) tidak boleh ditulis: itu akan
  // menimpa isi database dengan null saat bot mati sebelum load selesai.
  calls.length = 0;
  await flushAndClose(fake({ data: null }));
  assert.deepStrictEqual(calls, ['close'], 'data null tidak boleh ditulis');

  // Adapter tanpa close() (cloud) tetap sah
  calls.length = 0;
  assert.strictEqual(await flushAndClose(fake({ adapter: {} })), null);
  assert.deepStrictEqual(calls, ['write']);

  // Kegagalan dikembalikan, bukan dilempar — proses tetap harus bisa keluar
  const failed = await flushAndClose(fake({ write: async () => { throw new Error('disk penuh'); } }));
  assert.match(failed?.message || '', /disk penuh/);
  assert.strictEqual(await flushAndClose(undefined), null, 'db undefined bukan error');

  console.log('adapter.js self-check OK');
}
