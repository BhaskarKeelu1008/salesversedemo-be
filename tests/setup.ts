import 'reflect-metadata';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Suppress Mongoose warnings
mongoose.set('strictQuery', false);
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('[MONGOOSE]')) return;
  originalWarn(...args);
};

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
