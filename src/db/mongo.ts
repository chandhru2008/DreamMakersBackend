import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI as string;
const dbName = process.env.MONGO_DB_NAME as string;

let client: MongoClient;
let db: Db;

export const connectMongo = async (): Promise<Db> => {
  if (db) return db;

  console.log('🔌 Connecting to MongoDB...');

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  // optional ping check
  await client.db('admin').command({ ping: 1 });

  db = client.db(dbName);

  console.log('✅ MongoDB connected');

  // Ensure unique index
  try {
    await db.collection('Users').createIndex({ email: 1 }, { unique: true });

    console.log('💎 Unique index on "email" ensured');
  } catch (error: any) {
    console.error(
      '⚠️ Could not create index (check duplicates):',
      error.message
    );
  }

  return db;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('❌ Database not initialized');
  }

  return db;
};
