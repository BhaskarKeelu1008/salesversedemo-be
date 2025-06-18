import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

let mongoServer: MongoMemoryServer | null = null;
let isConnected = false;

export const connect = async (): Promise<void> => {
  try {
    if (isConnected) {
      console.log('Already connected to MongoDB Memory Server');
      return;
    }

    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'jest-test-db',
      },
    });

    const uri = mongoServer.getUri();
    console.log(`MongoDB Memory Server started at ${uri}`);

    await mongoose.connect(uri);
    isConnected = true;
    console.log('Connected to MongoDB Memory Server');
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      console.log('Closed Mongoose connection');
    }

    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
      isConnected = false;
      console.log('Stopped MongoDB Memory Server');
    }
  } catch (error) {
    console.error('Error cleaning up MongoDB Memory Server', error);
    throw error;
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (!isConnected) {
    console.warn('Cannot clear database: not connected');
    return;
  }

  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('Cleared all collections');
  } catch (error) {
    console.error('Error clearing database collections', error);
    throw error;
  }
};

process.on('SIGTERM', async () => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Failed to clean up MongoDB Memory Server on SIGTERM', error);
  } finally {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Failed to clean up MongoDB Memory Server on SIGINT', error);
  } finally {
    process.exit(0);
  }
});

describe('Database Test Setup', () => {
  test('MongoDB memory server functions should be defined', () => {
    expect(connect).toBeDefined();
    expect(closeDatabase).toBeDefined();
    expect(clearDatabase).toBeDefined();
  });
});
