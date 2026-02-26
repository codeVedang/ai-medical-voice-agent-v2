const { fork } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js and Cron worker concurrently...');

// We use 'fork' because it spawns new Node processes directly without needing cmd.exe 
// This avoids the 'spawn cmd.exe ENOENT' error on Windows.

const nextPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const cronPath = path.join(__dirname, 'cron-send-followups.js');

const nextProcess = fork(nextPath, ['dev'], { stdio: 'inherit' });
const cronProcess = fork(cronPath, [], { stdio: 'inherit' });

// Handle shutdown gracefully
const cleanup = () => {
    console.log('\n🛑 Shutting down dev server and cron worker...');
    nextProcess.kill('SIGINT');
    cronProcess.kill('SIGINT');
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

nextProcess.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    cronProcess.kill('SIGINT');
    process.exit(code);
});

cronProcess.on('exit', (code) => {
    console.log(`Cron process exited with code ${code}`);
});
