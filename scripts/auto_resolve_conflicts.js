const fs = require('fs');
const path = require('path');

function walk(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.sql', '.md']) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file === '.git' || file === 'node_modules') return;
      results.push(...walk(filePath, extensions));
    } else {
      if (extensions.includes(path.extname(file))) results.push(filePath);
    }
  });
  return results;
}

const allFiles = walk(process.cwd());
const conflictRegex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======[\s\S]*?\r?\n>>>>>>>[^\r\n]*/g;

const conflicted = allFiles.filter((f) => {
  try {
    const src = fs.readFileSync(f, 'utf8');
    return src.includes('<<<<<<< HEAD');
  } catch (e) { return false; }
});

if (!conflicted.length) {
  console.log('No conflict markers found.');
  process.exit(0);
}

console.log('Resolving conflict markers in', conflicted.length, 'files');

conflicted.forEach((file) => {
  try {
    const src = fs.readFileSync(file, 'utf8');
    const resolved = src.replace(conflictRegex, (_, headContent) => headContent.trimEnd());
    if (resolved !== src) {
      fs.writeFileSync(file, resolved, 'utf8');
      console.log('Resolved:', file);
    }
  } catch (err) {
    console.error('Failed to process', file, err.message);
  }
});

console.log('Done. Please review changes and run `git add` for updated files.');
