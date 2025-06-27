import 'reflect-metadata';
import mongoose from 'mongoose';

// Suppress Mongoose warnings
mongoose.set('strictQuery', false);
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('[MONGOOSE]')) return;
  originalWarn(...args);
};

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}); 