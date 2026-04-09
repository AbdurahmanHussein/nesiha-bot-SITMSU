const fs = require('fs');
const glob = require('glob'); // use standard fs for simplicity

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = dir + '/' + file;
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js')) filelist.push(dirFile);
    }
  }
  return filelist;
};

const routeFiles = walkSync('./server');
console.log('Found files:', routeFiles);

routeFiles.forEach(file => {
  if (file.includes('db.js')) return; // skip db

  let content = fs.readFileSync(file, 'utf8');

  // Convert db.prepare(...).get()
  // Pattern: db.prepare('SQL').get(a, b) -> await db.queryOne('SQL', [a, b])
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.get\((.*?)\)/g, "await db.queryOne($1, [$2])");
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.get\(\)/g, "await db.queryOne($1)");

  // Convert db.prepare(...).all()
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.all\((.*?)\)/g, "await db.query($1, [$2])");
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.all\(\)/g, "await db.query($1)");

  // Convert db.prepare(...).run()
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.run\((.*?)\)/g, "await db.execute($1, [$2])");
  content = content.replace(/db\.prepare\((['`].*?['`])\)\.run\(\)/g, "await db.execute($1)");

  // Fix multi-line prepares assigned to vars (e.g. const stmt = db.prepare(...); stmt.run(...) )
  // We'll have to manually review those or they break.

  fs.writeFileSync(file, content);
});

console.log('Refactoring applied.');
