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

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const resolvedFile = path.resolve(__dirname, path.basename(file));
  if (!resolvedFile.startsWith(path.resolve(__dirname) + path.sep)) {
    throw new Error('Invalid file path');
  }
  const args = [resolvedFile, ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  p.on('message', (data) => {
    console.log(chalk.cyan(`🟢 RECEIVED ${data}`));
    switch (data) {
      case 'reset':
        p.kill();
        isRunning = false;
        start(file);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  p.on('exit', (code) => {
    isRunning = false;
    log.err(`Exited with code: ${code}`);
    start('main.js');

    if (code === 0) return;

    // unwatch dulu: restart bisa terjadi berkali-kali -> tanpa ini StatWatcher
    // main.js menumpuk listener (leak -> MaxListenersExceededWarning)
    fs.unwatchFile(args[0]);
    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
      log.err(`File ${args[0]} has been modified. Script will restart...`);
      start('main.js');
    });
  });

  p.on('error', (err) => {
    log.err(`Error: ${err}`);
    p.kill();
    isRunning = false;
    log.err(`Error occurred. Script will restart...`);
    start('main.js');
  });
}

start('main.js');

// Keeps the event loop alive between the child process exiting and the
// restart above spawning a new one.
setInterval(() => {}, 1000);

const tmpDir = './tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
  log.info(`📁 Created directory ${tmpDir}`);
}

process.on('unhandledRejection', (reason) => {
  log.err(`Unhandled promise rejection: ${reason}`);
  log.err('Script will restart...');
  start('main.js');
});

process.on('exit', (code) => {
  log.err(`Exited with code: ${code}`);
  log.err('Script will restart...');
  start('main.js');
});
