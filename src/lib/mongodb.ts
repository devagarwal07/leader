
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'meritocracy_board';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

interface CachedMongoConnection {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

// Extend global to include the mongo property for caching
declare global {
  // eslint-disable-next-line no-var
  var mongo: CachedMongoConnection | undefined;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { client: null, promise: null };
}

async function connectToDatabase(): Promise<Db> {
  if (cached!.client) {
    const db = cached!.client.db(MONGODB_DB_NAME);
    // Quick ping to check if connection is alive
    try {
      await db.command({ ping: 1 });
      return db;
    } catch (e) {
      // Connection might be stale, reset and reconnect
      cached!.client = null;
      cached!.promise = null;
    }
  }

  if (!cached!.promise) {
    const opts = {
      // useNewUrlParser: true, // Deprecated in newer versions
      // useUnifiedTopology: true, // Deprecated in newer versions
    };
    cached!.promise = MongoClient.connect(MONGODB_URI!, opts).then((client) => {
      return client;
    });
  }
  
  try {
    cached!.client = await cached!.promise;
  } catch (e) {
    cached!.promise = null; // Reset promise on error
    throw e;
  }
  
  return cached!.client!.db(MONGODB_DB_NAME);
}

export default connectToDatabase;
