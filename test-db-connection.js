// Test script for MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('MongoDB URI:', MONGODB_URI ? '✓ Found' : '✗ Not found');

if (!MONGODB_URI) {
    console.error('\n❌ ERROR: MONGODB_URI is not defined in .env file');
    console.log('\nPlease ensure your .env file contains:');
    console.log('MONGODB_URI=mongodb://localhost:27017/your-database-name');
    console.log('or');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name');
    process.exit(1);
}

async function testConnection() {
    try {
        console.log('\n⏳ Attempting to connect to MongoDB...');

        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });

        console.log('\n✅ SUCCESS: Connected to MongoDB!');
        console.log('Database Name:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);
        console.log('Port:', mongoose.connection.port);
        console.log('Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');

        // Test a simple operation
        console.log('\n⏳ Testing database operations...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collection(s) in database:`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        console.log('\n✅ Database connection test completed successfully!');

    } catch (error) {
        console.error('\n❌ ERROR: Failed to connect to MongoDB');
        console.error('Error details:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   - Ensure MongoDB is running on your system');
            console.log('   - Check if the connection string is correct');
            console.log('   - Verify the port number (default: 27017)');
        } else if (error.message.includes('authentication failed')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   - Check your username and password');
            console.log('   - Ensure the user has proper permissions');
        } else if (error.message.includes('MONGODB_URI')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   - Check your .env file configuration');
            console.log('   - Ensure MONGODB_URI is properly set');
        }

        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed.');
    }
}

testConnection();
