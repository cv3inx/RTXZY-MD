// Logger terminal untuk pesan bot sendiri (boot, koneksi, hot-reload, error).
//
// Formatnya sengaja memakai kolom jam yang sama dengan log pesan di print.js,
// jadi log sistem dan log chat sejajar dan mudah dipisahkan mata:
//
//   16:06:30  ok      Tersambung sebagai Bot · +628123456789
//   16:06:41  reload  plugins/main/menu.js
//   16:06:43  Ditzzy · +62 898-8293-493  ›  DM
//             .ping
//
// Catatan: `conn.logger` dari zapo-js adalah noop logger, jadi apa pun yang
// dikirim ke sana tidak pernah muncul. Pakai modul ini untuk pesan kita.
import chalk from 'chalk';

const LABEL_WIDTH = 6;
const TIME_WIDTH = 8;
const FIELD_WIDTH = 10;
const INDENT = '  ';

const stamp = () => new Date().toTimeString().slice(0, TIME_WIDTH);

function emit(paint, label, message) {
  console.log(`${chalk.dim(stamp())}  ${paint(label.padEnd(LABEL_WIDTH))}  ${message}`);
}

const log = {
  // --- Ringkasan saat boot ---------------------------------------------------
  // Tanpa jam: semuanya terjadi dalam detik yang sama, jadi stempel waktu cuma
  // mengulang dirinya sendiri dan menutupi isinya. Label sejajar supaya bisa
  // dibaca sebagai tabel.

  banner: (title, subtitle) => console.log(`\n${INDENT}${chalk.bold.green(title)}${subtitle ? chalk.dim(`  ${subtitle}`) : ''}\n`),

  // Spasi ditambahkan sebelum padding supaya label yang lebih panjang dari
  // kolom tetap punya pemisah, tidak menempel ke nilainya.
  field: (label, value) => console.log(`${INDENT}${chalk.dim(`${label} `.padEnd(FIELD_WIDTH))}${value}`),

  /** Baris penutup boot: bot siap dipakai. */
  ready: (message) => console.log(`\n${INDENT}${chalk.green('●')} ${chalk.bold(message)}`),

  // --- Kejadian saat berjalan ------------------------------------------------
  // Pakai jam, karena di sini waktu kejadian justru yang penting.

  info: (message) => emit(chalk.cyan, 'info', message),
  ok: (message) => emit(chalk.bold.green, 'ok', message),
  warn: (message) => emit(chalk.yellow, 'warn', message),
  error: (message) => emit(chalk.bold.red, 'error', message),
  reload: (message) => emit(chalk.magenta, 'reload', message),

  /** Baris lanjutan tanpa label, sejajar di kolom pesan. */
  detail: (message) => console.log(`${' '.repeat(TIME_WIDTH + 2 + LABEL_WIDTH + 2)}${chalk.dim(message)}`),

  blank: () => console.log()
};

export default log;
export { log };

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((mod) => mod.default);

  const capture = (fn) => {
    const lines = [];
    const real = console.log;
    console.log = (...args) => lines.push(args.join(' '));
    try {
      fn();
    } finally {
      console.log = real;
    }
    return lines;
  };

  const [line] = capture(() => log.ok('Tersambung'));
  assert.match(line, /^\d\d:\d\d:\d\d {2}ok {6}Tersambung$/, line);

  // Semua level harus sejajar: pesan mulai di kolom yang sama
  const column = (message) => message.indexOf('X');
  const lines = capture(() => {
    log.info('X');
    log.ok('X');
    log.warn('X');
    log.error('X');
    log.reload('X');
  });
  const columns = new Set(lines.map(column));
  assert.strictEqual(columns.size, 1, `semua level harus sejajar, dapat kolom ${[...columns]}`);
  assert.strictEqual(lines.length, 5);

  // detail() sejajar dengan kolom pesan, bukan kolom label
  const [detail] = capture(() => log.detail('X'));
  assert.strictEqual(column(detail), [...columns][0], 'detail() harus sejajar dengan kolom pesan');

  assert.deepStrictEqual(
    capture(() => log.blank()),
    [''],
    'blank() satu baris kosong'
  );

  // field(): tanpa jam, label sejajar satu sama lain
  const fields = capture(() => {
    log.field('Runtime', 'X');
    log.field('Database', 'X');
    log.field('Prefix', 'X');
  });
  const fieldColumns = new Set(fields.map(column));
  assert.strictEqual(fieldColumns.size, 1, `field harus sejajar, dapat kolom ${[...fieldColumns]}`);
  assert.ok(
    fields.every((f) => !/^\d\d:\d\d:\d\d/.test(f)),
    'field() tidak boleh memakai stempel waktu'
  );

  // Label lebih panjang dari kolom tidak boleh memotong nilainya
  const [wide] = capture(() => log.field('LabelYangSangatPanjang', 'X'));
  assert.ok(wide.includes('LabelYangSangatPanjang X'), wide);

  // ready() menonjol dengan baris kosong di atasnya
  const readyLines = capture(() => log.ready('Tersambung'));
  assert.strictEqual(readyLines.length, 1);
  assert.ok(readyLines[0].startsWith('\n') && readyLines[0].includes('Tersambung'), JSON.stringify(readyLines[0]));

  console.log('log.js self-check OK');
  process.exit(0);
}
