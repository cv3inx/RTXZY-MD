const __dirname = import.meta.dirname;
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import http from 'http';
import chalk from 'chalk';

const log = {
  info: (m) => console.log(chalk.yellow(m)),
  ok: (m) => console.log(chalk.green(m)),
  err: (m) => console.error(chalk.red(m))
};

const nodeVersion = parseInt(process.versions.node.split('.')[0]);
if (nodeVersion < 22) {
  log.err(`❌ Node.js ${nodeVersion} is not supported. Please use Node.js 22 or higher.`);
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
      log.info(`Port ${port} is already in use, trying another random port`);
      listenOnPort(0);
      return;
    }

    log.err(`failed: ${e}`);
    process.exit(1);
  });

  server.listen(port, '0.0.0.0', () => log.info(`🔌 Port ${server.address().port} is open`));
}

function printBanner() {
  log.info(`🖥️  ${os.type()}, ${os.release()} - ${os.arch()}`);
  log.info(`💾 Total RAM: ${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`);
  log.info(`💽 Free RAM: ${(os.freemem() / 1024 ** 3).toFixed(2)} GB`);
  try {
    require.resolve('zapo-js');
    log.info(`🟡 zapo-js library version ${require('zapo-js/package.json').version} is installed`);
  } catch {
    log.err(`❌ zapo-js library is not installed`);
  }
  log.info(`📃 Script by BOTCAHX`);
  log.info(`🔗 Github: https://github.com/BOTCAHX/RTXZY-MD`);
}

listenOnPort(Number(process.env.PORT) || 0);
printBanner();

const MAIN = path.resolve(__dirname, 'main.js');
const HEALTHY_AFTER_MS = 5000; // hidup selama ini = dianggap start yang sehat
const MAX_BACKOFF_MS = 30000;

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
    console.log(chalk.cyan(`🟢 RECEIVED ${data}`));
    switch (data) {
      case 'reset':
        child.kill();
        break;
      case 'uptime':
        child.send(process.uptime());
        break;
    }
  });

  child.on('error', (err) => log.err(`Spawn error: ${err}`));

  child.on('exit', (code, signal) => {
    child = null;
    if (stopping) return;
    log.err(`Exited with ${signal ? `signal ${signal}` : `code ${code}`}`);

    // Backoff kalau main.js mati seketika berulang kali (mis. syntax error).
    // Tanpa ini supervisor spawn tanpa henti dan menghabiskan CPU.
    if (Date.now() - startedAt < HEALTHY_AFTER_MS) crashStreak++;
    else crashStreak = 0;

    if (crashStreak === 0) return start();

    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (crashStreak - 1));
    log.err(`Crashed ${crashStreak}x langsung setelah start, restart dalam ${delay / 1000}s...`);
    setTimeout(start, delay).unref();
    // unwatch dulu: restart bisa terjadi berkali-kali -> tanpa ini StatWatcher
    // main.js menumpuk listener (leak -> MaxListenersExceededWarning)
    fs.unwatchFile(MAIN);
    fs.watchFile(MAIN, () => restart(`File ${MAIN} diubah, restart sekarang...`));
  });
}

// Restart sekarang tanpa menunggu backoff. Kalau child masih hidup, dimatikan
// dulu - handler 'exit' di atas yang menghidupkannya lagi. Memanggil start()
// langsung tidak akan berefek selama `child` masih terisi.
function restart(reason) {
  log.err(reason);
  crashStreak = 0;
  if (child) child.kill();
  else start();
}

const tmpDir = './tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
  log.info(`📁 Created directory ${tmpDir}`);
}

start();

// HTTP server yang listening sudah menahan event loop tetap hidup, termasuk di
// jeda antara child mati dan spawn berikutnya - tidak perlu setInterval kosong.

process.on('unhandledRejection', (reason) => {
  // Restart ditangani oleh handler 'exit' milik child. Supervisor cukup mencatat.
  log.err(`Unhandled promise rejection di supervisor: ${reason}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    log.info(`\n${signal} diterima, menghentikan bot...`);
    fs.unwatchFile(MAIN);
    if (child) child.kill(signal);
    server.close();
    process.exit(0);
  });
}
