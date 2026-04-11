const { getDb } = require('./server/db');
const bcrypt = require('bcryptjs');

const db = getDb();

try {
  db.exec('ALTER TABLE admin_users ADD COLUMN profile_photo TEXT;');
  console.log('Added profile_photo column.');
} catch(e) {
  if (!e.message.includes('duplicate column name')) {
    console.error(e);
  }
}

// Update admin credentials
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync('nesihaAdmin#26', salt);

db.prepare(`
  UPDATE admin_users
  SET email = 'abdurahman.h.beriso@gmail.com', password_hash = ?
  WHERE id = 1
`).run(hash);

console.log('Admin credentials updated.');
