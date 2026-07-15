const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to Google Public DNS to avoid local ISP SRV resolution issues
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn("Warning: Could not set custom DNS servers:", dnsErr.message);
}

// Attempt to load dotenv
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  // If dotenv fails, we can parse .env.local manually
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Error: MONGODB_URI not found in environment or .env.local file");
  process.exit(1);
}

const backupDir = path.join(__dirname, '../db_backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function runBackup() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  console.log(`Found ${collections.length} collections. Starting backup...`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    console.log(`Backing up collection: ${colName}...`);
    const documents = await db.collection(colName).find({}).toArray();

    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf8');
    console.log(`Saved ${documents.length} documents to db_backup/${colName}.json`);
  }

  console.log("\nBackup successfully completed! Check your local 'db_backup/' directory.");
  await mongoose.disconnect();
}

runBackup().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
