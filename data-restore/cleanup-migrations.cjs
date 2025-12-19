const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
const backupDir = path.join(__dirname, '..', 'supabase', 'migrations_old');

// Create backup dir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Move all files except the new one we want to keep
const files = fs.readdirSync(migrationsDir);
for (const file of files) {
  if (file.endsWith('.sql') && !file.startsWith('20251218')) {
    const src = path.join(migrationsDir, file);
    const dest = path.join(backupDir, file);
    fs.renameSync(src, dest);
    console.log(`Moved: ${file}`);
  }
}

// Copy EXECUTAR_NO_DASHBOARD.sql as new migration
const srcSql = path.join(__dirname, 'EXECUTAR_NO_DASHBOARD.sql');
const destSql = path.join(migrationsDir, '20251218000000_criar_tabelas.sql');
fs.copyFileSync(srcSql, destSql);
console.log('Created: 20251218000000_criar_tabelas.sql');

console.log('Done!');
