const __dirname = import.meta.dirname;
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import chalk from 'chalk';
import log from './lib/system/log.js';

const nodeVersion = parseInt(process.versions.node.split('.')[0]);
if (nodeVersion < 22) {
  log.error(`Node.js ${nodeVersion} tidak didukung, butuh Node.js 22 atau lebih baru.`);
  process.exit(1);
}

// HTTP Server
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'application/json');
    const data = {
      status: 'true',
      message: 'Bot Successfully Activated!',
      author: 'BOTCAHX'
    };
    res.writeHead(200);
    res.end(JSON.stringify({ response: data }, null, 2));
  } else {
    res.writeHead(404);
    res.end();
  }
});

function listenOnPort(port) {
  server.once('error', (e) => {
    if (e.code === 'EADDRINUSE' && port !== 0) {
      log.warn(`Port ${port} sudah dipakai, mencoba port acak`);
      listenOnPort(0);
      return;
    }

    log.error(`HTTP server gagal: ${e}`);
    process.exit(1);
  });

  server.listen(port, '0.0.0.0', () => log.field('Server', `http://0.0.0.0:${server.address().port}`));
}

function printBanner() {
  let zapoVersion = null;
  try {
    require.resolve('zapo-js');
    zapoVersion = require('zapo-js/package.json').version;
  } catch {}
  log.banner('RTXZY-MD', `bot WhatsApp · zapo-js ${zapoVersion || chalk.red('tidak terpasang')}`);
  log.field('Runtime', `Node ${process.versions.node} · ${os.type()} ${os.arch()}`);
  log.field('Memori', `${(os.freemem() / 1024 ** 3).toFixed(1)} / ${(os.totalmem() / 1024 ** 3).toFixed(1)} GB bebas`);
}

printBanner();
listenOnPort(Number(process.env.PORT) || 0);

const MAIN = path.resolve(__dirname, 'main.js');
const HEALTHY_AFTER_MS = 5000; // hidup selama ini = dianggap start yang sehat
const MAX_BACKOFF_MS = 30000;
const SHUTDOWN_GRACE_MS = 5000; // jatah main.js menyimpan database saat berhenti

let child = null;
let crashStreak = 0;
let stopping = false;

function start() {
  if (child || stopping) return;

  const args = [MAIN, ...process.argv.slice(2)];
  const startedAt = Date.now();
  child = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  child.on('message', (data) => {
    // 'uptime' dipanggil plugin dan bisa sering, jadi tidak dicatat.
    if (data !== 'uptime') log.info(`IPC: ${data}`);
    switch (data) {
      case 'reset':
        child.kill();
        break;
      case 'uptime':
        child.send(process.uptime());
        break;
    }
  });

  child.on('error', (err) => log.error(`Gagal spawn main.js: ${err}`));

  child.on('exit', (code, signal) => {
    child = null;
    if (stopping) return;
    log.warn(`main.js berhenti (${signal ? `signal ${signal}` : `exit ${code}`})`);

    // Backoff kalau main.js mati seketika berulang kali (mis. syntax error).
    // Tanpa ini supervisor spawn tanpa henti dan menghabiskan CPU.
    if (Date.now() - startedAt < HEALTHY_AFTER_MS) crashStreak++;
    else crashStreak = 0;

    if (crashStreak === 0) return start();

    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (crashStreak - 1));
    log.error(`Crash ${crashStreak}x langsung setelah start, restart dalam ${delay / 1000}s`);
    setTimeout(start, delay).unref();
    // unwatch dulu: restart bisa terjadi berkali-kali -> tanpa ini StatWatcher
    // main.js menumpuk listener (leak -> MaxListenersExceededWarning)
    fs.unwatchFile(MAIN);
    fs.watchFile(MAIN, () => restart('main.js diubah, restart sekarang'));
  });
}

// Restart sekarang tanpa menunggu backoff. Kalau child masih hidup, dimatikan
// dulu - handler 'exit' di atas yang menghidupkannya lagi. Memanggil start()
// langsung tidak akan berefek selama `child` masih terisi.
function restart(reason) {
  log.reload(reason);
  crashStreak = 0;
  if (child) child.kill();
  else start();
}

const tmpDir = './tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
  log.info(`Folder ${tmpDir} dibuat`);
}

start();

// HTTP server yang listening sudah menahan event loop tetap hidup, termasuk di
// jeda antara child mati dan spawn berikutnya - tidak perlu setInterval kosong.

process.on('unhandledRejection', (reason) => {
  // Restart ditangani oleh handler 'exit' milik child. Supervisor cukup mencatat.
  log.error(`Unhandled rejection di supervisor: ${reason}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    log.warn(`${signal} diterima, menghentikan bot`);
    fs.unwatchFile(MAIN);
    server.close();
    if (!child) return process.exit(0);

    // Ditunggu, tidak langsung exit: main.js menyimpan database dulu saat
    // menerima sinyal. Kalau supervisor mati lebih dulu, child terbunuh di
    // tengah penulisan dan perubahan terakhir hilang.
    child.once('exit', () => process.exit(0));
    child.kill(signal);
    setTimeout(() => {
      log.error(`main.js tidak berhenti dalam ${SHUTDOWN_GRACE_MS / 1000}s, dipaksa`);
      child?.kill('SIGKILL');
      process.exit(1);
    }, SHUTDOWN_GRACE_MS);
  });
}
