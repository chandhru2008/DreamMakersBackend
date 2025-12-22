import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';


dotenv.config();
const uri = process.env.MONGO_URI!;
const dbName = process.env.MONGO_DB_NAME!;

let client: MongoClient;
let db: Db;

export const connectMongo = async (): Promise<Db> => {
  if (db) {
    return db; // reuse existing connection
  }
  console.log('🔌 Connecting to MongoDB...', db);
  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log('✅ MongoDB connected');
  
  return db;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error('❌ Database not initialized');
  }
  return db;
};
