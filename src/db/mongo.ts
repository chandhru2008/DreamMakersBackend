import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';


dotenv.config();
const uri = process.env.MONGO_URI!;
const dbName = process.env.MONGO_DB_NAME!;

let client: MongoClient;
let db: Db;

export const connectMongo = async (): Promise<Db> => {
  if (db) return db;

  console.log('🔌 Connecting to MongoDB...');
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log('✅ MongoDB connected');

  // --- NEW: Create the unique index here ---
  try {
    await db.collection('Users').createIndex(
      { email: 1 },
      { unique: true }
    );
    console.log('💎 Unique index on "email" ensured');
  } catch (error: any) {
    // If you have duplicates already, this will fail
    console.error('⚠️ Could not create index (check for existing duplicates):', error.message);
  }
  return db;
};
export const getDb = (): Db => {
  if (!db) {
    throw new Error('❌ Database not initialized');
  }
  return db;
};
