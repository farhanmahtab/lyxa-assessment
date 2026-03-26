import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../auth-service/src/modules/users/user.model';
import { Product } from '../product-service/src/modules/products/product.model';
import { buildSchema } from '@typegoose/typegoose';

dotenv.config();

const AUTH_DB_URI = process.env.AUTH_MONGODB_URI || 'mongodb://admin:secret@localhost:27017/lyxa_auth?authSource=admin';
const PRODUCT_DB_URI = process.env.PRODUCT_MONGODB_URI || 'mongodb://admin:secret@localhost:27017/lyxa_products?authSource=admin';

async function seed() {
  console.log('🌱 Starting Seeding...');

  // 1. Setup Connections
  const authConn = await mongoose.createConnection(AUTH_DB_URI).asPromise();
  const productConn = await mongoose.createConnection(PRODUCT_DB_URI).asPromise();

  // 2. Define Models
  const UserModel = authConn.model('User', buildSchema(User));
  const ProductModel = productConn.model('Product', buildSchema(Product));

  // 3. Clear Data
  await UserModel.deleteMany({});
  await ProductModel.deleteMany({});
  console.log('🧹 Cleared existing data.');

  // 4. Seed Users
  const password = await bcrypt.hash('password123', 10);
  
  const users = [
    { name: 'Admin User', email: 'admin@lyxa.com', password, role: 'admin' },
    { name: 'John Seller', email: 'john@lyxa.com', password, role: 'user' },
    { name: 'Sarah Vendor', email: 'sarah@lyxa.com', password, role: 'user' },
  ];

  const createdUsers = await UserModel.insertMany(users);
  console.log(`👤 Seeded ${createdUsers.length} users.`);

  // 5. Seed Products
  const products = [
    { title: 'MacBook Pro', description: 'Powerful laptop', price: 1999, ownerId: createdUsers[1]._id.toString() },
    { title: 'MacBook Air', description: 'Office laptop', price: 1200, ownerId: createdUsers[1]._id.toString() },
    { title: 'iPhone 15', description: 'Apple smartphone', price: 799, ownerId: createdUsers[1]._id.toString() },
    { title: 'iPhone 16', description: 'Apple smartphone', price: 899, ownerId: createdUsers[1]._id.toString() },
    { title: 'iPhone 17', description: 'Apple smartphone', price: 999, ownerId: createdUsers[1]._id.toString() },
    { title: 'iPhone 18', description: 'Latest smartphone', price: 1099, ownerId: createdUsers[1]._id.toString() },
    { title: 'Sony Headphones', description: 'Noise cancelling', price: 349, ownerId: createdUsers[2]._id.toString() },
  ];

  await ProductModel.insertMany(products);
  console.log(`📦 Seeded ${products.length} products.`);

  // 6. Close Connections
  await authConn.close();
  await productConn.close();
  
  console.log('✅ Seeding Complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Error:', err);
  process.exit(1);
});
