/**
 * Database Backup Script
 * Dumps all collections (products, schools, categories, settings, etc.) to backups/<timestamp>/
 * Prints DB name and host with credentials hidden.
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function backupDatabase(): Promise<string> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indraprasth';
  const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  console.log('🔄 Connecting to MongoDB for backup...');
  console.log(`🔌 Host & Target: ${maskedUri}`);

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db!;
  const dbName = db.databaseName;
  console.log(`📦 Database Name: ${dbName}`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, `../../../backups/${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const collections = await db.listCollections().toArray();
  const summary: Record<string, number> = {};

  for (const col of collections) {
    const colName = col.name;
    const docs = await db.collection(colName).find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    summary[colName] = docs.length;
    console.log(`  💾 Dumped ${docs.length} documents from "${colName}" -> ${filePath}`);
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  const manifest = {
    timestamp: new Date().toISOString(),
    databaseName: dbName,
    connectionTarget: maskedUri,
    collections: summary,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`✅ Backup successfully saved to: ${backupDir}`);
  await mongoose.disconnect();
  return backupDir;
}

if (require.main === module) {
  backupDatabase().catch((err) => {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  });
}
