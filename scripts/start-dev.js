import esbuild from 'esbuild';
import chalk from 'chalk';
import { spawn } from 'child_process';

const outfile = './.dev-server/index.js';
const entryPoint = './src/index.ts';

let worker;

(async function () {
  // ๐ฆ bundle typescript files into one js file, and watch for changes.
  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      external: ['./node_modules/*'],
      platform: 'node',
      outfile,
      format: 'esm',
      bundle: true,
      define: { DEBUG: 'true' },
      watch: {
        async onRebuild(error) {
          if (error) {
            console.error(chalk.red('โ Build failed !!'));
            console.log(chalk.yellow('\n๐ Waiting for new changes ...\n'));
            return;
          }

          run(); // run if file changes
        },
      },
    });

    run(); // first run
  } catch (error) {
    console.log(error);
  }
})();

// to run bundled file.
async function run() {
  // ๐ช kill last spawned worker
  if (worker) {
    try {
      process.kill(worker.pid);
    } catch (error) {
      console.error(chalk.red('โ Failed to kill worker !!'));
    }
  }

  //๐งน clean up console logs
  console.clear();

  //๐ฅ start new worker
  console.log(chalk.yellow(`\n๐ Watching for changes in "./src/**/*" ...\n`));
  worker = spawn('node', [outfile], {
    stdio: 'inherit',
  });

  //๐ listen for worker exit signal.
  worker.on('exit', async code => {
    if (code !== 0) return;
    console.log(chalk.yellow(`\n\n๐ Waiting for new changes ...`));
  });
}
