import chalk from 'chalk';
import util from 'util';

const FIELD_WIDTH = 10;
const INDENT = '  ';
const LEVEL_WIDTH = 7; // 'WARNING' dan 'SUCCESS' sama-sama 7 huruf — label terpanjang

const shortDate = () =>
  new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

const PREFIX_WIDTH = ` [${'SUCCESS'.padEnd(LEVEL_WIDTH)}] ${shortDate()}:`.length;

function emit(paint, label, args) {
  const prefix = `${label.padEnd(LEVEL_WIDTH)} [${shortDate()}]:`;
  console.log(paint(prefix), util.format(...args));
}

const log = {
  banner: (title, subtitle) => console.log(`\n${INDENT}${chalk.bold.green(title)}${subtitle ? chalk.dim(`  ${subtitle}`) : ''}\n`),
  field: (label, value) => console.log(`${INDENT}${chalk.dim(`${label} `.padEnd(FIELD_WIDTH))}${value}`),
  ready: (message) => console.log(`\n${INDENT}${chalk.green('●')} ${chalk.bold(message)}`),

  info(...args) {
    emit(chalk.bold.rgb(16, 122, 183), 'INFO', args);
  },
  warn(...args) {
    emit(chalk.bold.rgb(239, 225, 3), 'WARNING', args);
  },
  error(...args) {
    emit(chalk.bold.rgb(247, 38, 33), 'ERROR', args);
  },
  success(...args) {
    emit(chalk.bold.rgb(0, 200, 120), 'SUCCESS', args);
  },
  
  reload(...args) {
    emit(chalk.bold.rgb(255, 141, 47), 'HOT RELOAD', args);
  },

  detail: (message) => console.log(`${' '.repeat(PREFIX_WIDTH + 1)}${chalk.dim(message)}`),

  blank: () => console.log()
};

export default log;
export { log };