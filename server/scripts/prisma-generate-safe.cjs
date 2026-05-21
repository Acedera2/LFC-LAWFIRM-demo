#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function removeTmpFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.includes('.tmp') || f.endsWith('.tmp') || f.includes('query_engine')) {
        try { fs.unlinkSync(path.join(dir, f)); } catch (e) {}
      }
    }
  } catch (e) {
    // ignore
  }
}

function cleanupCandidates() {
  const root = path.resolve(__dirname, '..', '..'); // repo root
  const server = path.resolve(__dirname, '..');
  return [
    path.join(root, 'node_modules', '.prisma', 'client'),
    path.join(server, 'node_modules', '.prisma', 'client'),
    path.join(root, 'node_modules', '@prisma', 'client'),
    path.join(server, 'node_modules', '@prisma', 'client')
  ];
}

function runPrismaGenerate() {
  const env = Object.assign({}, process.env);
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['prisma', 'generate'];
  const res = spawnSync(cmd, args, { stdio: 'inherit', env });
  return res.status === 0;
}

(async function main(){
  const candidates = cleanupCandidates();
  // On Windows, try to stop OneDrive if it is running (common lock cause)
  if (process.platform === 'win32') {
    try {
      const { spawnSync } = require('child_process');
      const list = spawnSync('tasklist', [], { encoding: 'utf8' }).stdout || '';
      if (list.toLowerCase().includes('onedrive.exe') || list.toLowerCase().includes('onedrive')) {
        console.log('OneDrive process detected. Attempting to stop OneDrive to release file locks...');
        try {
          spawnSync('taskkill', ['/IM', 'OneDrive.exe', '/F'], { stdio: 'inherit' });
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {}
  }
  for (const dir of candidates) {
    removeTmpFiles(dir);
    // attempt to remove known locked query engine files
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (/query_engine/i.test(f)) {
          try { fs.unlinkSync(path.join(dir, f)); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // Retry loop
  const maxAttempts = 3;
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`Prisma generate attempt ${i}/${maxAttempts}`);
    const ok = runPrismaGenerate();
    if (ok) {
      console.log('Prisma generate succeeded');
      process.exit(0);
    }
    console.warn('Prisma generate failed, retrying after cleanup...');
    // try cleanup again
    for (const dir of candidates) {
      removeTmpFiles(dir);
    }
    await new Promise((r) => setTimeout(r, 1000 * i));
  }
  console.error('Prisma generate failed after retries');
  console.error('Hints:');
  console.error('- On Windows, OneDrive or antivirus may lock Prisma binaries. Try pausing OneDrive or excluding this folder.');
  console.error('- Run `npm run prisma:generate` manually in an elevated shell to see detailed errors.');
  process.exit(1);
})();
