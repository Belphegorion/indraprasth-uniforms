/**
 * Database Rollback Script
 * Restores collections from backups/<timestamp>/
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function rollbackDatabase(backupDirName?: string) {
  const backupsRoot = path.resolve(__dirname, '../../../backups');
  if (!fs.existsSync(backupsRoot)) {
    console.error('❌ No backups directory found.');
    process.exit(1);
  }

  let targetDir = backupDirName;
  if (!targetDir) {
    // Pick latest
    const entries = fs.readdirSync(backupsRoot).filter((f) => fs.statSync(path.join(backupsRoot, f)).isDirectory());
    entries.sort().reverse();
    if (entries.length === 0) {
      console.error('❌ No backup snapshots found.');
      process.exit(1);
    }
    targetDir = entries[0];
  }

  const fullPath = path.isAbsolute(targetDir) ? targetDir : path.join(backupsRoot, targetDir);
  console.log(`🔄 Rolling back from snapshot: ${fullPath}`);

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indraprasth';
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db!;

  const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
  for (const f of files) {
    const colName = f.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(fullPath, f), 'utf-8'));
    console.log(`  Restoring "${colName}" (${data.length} documents)...`);
    await db.collection(colName).deleteMany({});
    if (data.length > 0) {
      // Re-hydrate ObjectIds if present
      const docs = data.map((d: any) => {
        if (d._id && typeof d._id === 'string' && d._id.length === 24) {
          d._id = new mongoose.Types.ObjectId(d._id);
        }
        return d;
      });
      await db.collection(colName).insertMany(docs);
    }
  }

  console.log('✅ Rollback completed successfully.');
  await mongoose.disconnect();
}

if (require.main === module) {
  const arg = process.argv[2];
  rollbackDatabase(arg).catch((err) => {
    console.error('❌ Rollback failed:', err);
    process.exit(1);
  });
}
