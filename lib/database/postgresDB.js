import pg from 'pg';

/**
 * Nama tabel ikut argumen posisional (beberapa bot di satu database), dan ia
 * masuk ke SQL sebagai identifier — bukan parameter — jadi dibersihkan dulu.
 */
export function sanitizeTableName(name) {
  const clean = String(name ?? '').replace(/[^a-zA-Z0-9_]/g, '');
  if (!clean || /^\d/.test(clean)) throw new Error(`Nama tabel postgres tidak valid: '${name}'`);
  return clean.toLowerCase();
}

/**
 * Adapter lowdb berbasis PostgreSQL. Seluruh `db.data` disimpan sebagai satu
 * baris JSONB — bentuk yang sama seperti adapter MongoDB, bukan satu baris per
 * entry seperti sqliteDB.js.
 *
 * ponytail: satu dokumen ditulis ulang penuh setiap flush (30 detik). Kalau
 * database sudah puluhan MB dan bandwidth jadi masalah, pecah jadi tabel
 * kv (collection, key, value) dengan upsert per key seperti sqliteDB.js.
 */
export default class PostgresAdapter {
  constructor(url, table = 'bot_data') {
    this.table = sanitizeTableName(table);
    // max 2: bot ini cuma butuh satu read saat boot dan satu write tiap 30
    // detik, tidak ada gunanya menahan sepuluh koneksi di server.
    this.pool = new pg.Pool({ connectionString: url, max: 2 });
  }

  /** Sekali per proses, disimpan sebagai promise supaya read()/write() yang
   * jalan bersamaan tidak membuat tabel dua kali. Kalau gagal, cache dilepas
   * supaya penulisan berikutnya mencoba lagi, bukan gagal permanen. */
  _init() {
    this._ready ||= this.pool.query(`CREATE TABLE IF NOT EXISTS ${this.table} (id smallint PRIMARY KEY, data jsonb NOT NULL)`).catch((e) => {
      this._ready = null;
      throw e;
    });
    return this._ready;
  }

  async read() {
    await this._init();
    const { rows } = await this.pool.query(`SELECT data FROM ${this.table} WHERE id = 1`);
    return rows[0]?.data ?? null;
  }

  async write(data) {
    if (!data || typeof data !== 'object') return;
    await this._init();
    await this.pool.query(`INSERT INTO ${this.table} (id, data) VALUES (1, $1::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`, [JSON.stringify(data)]);
  }

  close() {
    return this.pool.end();
  }
}

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((m) => m.default);

  assert.strictEqual(sanitizeTableName('bot_data'), 'bot_data');
  assert.strictEqual(sanitizeTableName('Bot_Data'), 'bot_data');
  // Argumen posisional jadi prefix nama tabel, dan karakter aneh dibuang —
  // `node index.js "bot2; DROP TABLE bot_data --"` tidak boleh jadi SQL.
  assert.strictEqual(sanitizeTableName('bot2_bot_data'), 'bot2_bot_data');
  assert.strictEqual(sanitizeTableName('bot2; DROP TABLE bot_data --_bot_data'), 'bot2droptablebot_data_bot_data');
  assert.throws(() => sanitizeTableName(''), /tidak valid/);
  assert.throws(() => sanitizeTableName('--'), /tidak valid/);
  assert.throws(() => sanitizeTableName('2bot'), /tidak valid/, 'identifier tidak boleh diawali angka');

  // Alur read/write/close tanpa server: pool diganti stub. `new pg.Pool()`
  // sendiri tidak menyambung ke mana pun sampai query pertama, jadi aman.
  // Catatan: ini tidak memvalidasi sintaks SQL-nya — cuma postgres yang bisa.
  const stub = (rowsFor = () => ({ rows: [] })) => {
    const queries = [];
    return {
      queries,
      query: async (sql, params) => {
        queries.push({ sql, params });
        return rowsFor(sql);
      },
      end: async () => queries.push({ sql: 'END' })
    };
  };

  const withStub = (pool) => {
    const adapter = new PostgresAdapter('postgres://tidak/dipakai', 'bot_data');
    adapter.pool.end();
    adapter.pool = pool;
    return adapter;
  };

  let pool = stub();
  let adapter = withStub(pool);
  assert.strictEqual(await adapter.read(), null, 'database kosong dibaca sebagai null, bukan undefined');
  assert.match(pool.queries[0].sql, /CREATE TABLE IF NOT EXISTS bot_data/);
  assert.match(pool.queries[1].sql, /SELECT data FROM bot_data WHERE id = 1/);

  await adapter.write({ users: { a: 1 } });
  assert.strictEqual(pool.queries.length, 3, 'tabel dibuat sekali, bukan tiap query');
  assert.match(pool.queries[2].sql, /INSERT INTO bot_data .*ON CONFLICT \(id\) DO UPDATE/s);
  assert.deepStrictEqual(pool.queries[2].params, ['{"users":{"a":1}}']);

  await adapter.write(null);
  assert.strictEqual(pool.queries.length, 3, 'data kosong tidak menimpa isi database');
  await adapter.close();
  assert.strictEqual(pool.queries.at(-1).sql, 'END');

  pool = stub((sql) => (sql.startsWith('SELECT') ? { rows: [{ data: { users: { a: 1 } } }] } : { rows: [] }));
  assert.deepStrictEqual(await withStub(pool).read(), { users: { a: 1 } }, 'jsonb dibaca sebagai objek apa adanya');

  // CREATE TABLE gagal (server belum siap) tidak boleh dicache sebagai gagal
  // permanen — penulisan 30 detik berikutnya harus mencoba lagi.
  let attempt = 0;
  adapter = withStub({
    query: async () => {
      if (++attempt === 1) throw new Error('server mati');
      return { rows: [] };
    },
    end: async () => {}
  });
  await assert.rejects(() => adapter.read(), /server mati/);
  assert.strictEqual(await adapter.read(), null, 'percobaan kedua jalan lagi');

  console.log('postgresDB.js self-check OK');
}
