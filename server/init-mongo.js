// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization...');

// Switch to the finansier database
db = db.getSiblingDB('finansier');

// Create collections if they don't exist
db.createCollection('kpis');
db.createCollection('products');
db.createCollection('transactions');

// Create indexes for better performance
db.kpis.createIndex({ "createdAt": 1 });
db.products.createIndex({ "name": 1 });
db.transactions.createIndex({ "date": 1 });

print('MongoDB initialization completed successfully!');
print('Database: finansier');
print('Collections: kpis, products, transactions');
