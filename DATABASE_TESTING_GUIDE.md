# Database Connection Testing Guide

## ✅ Test Results

Your MongoDB database connection is **WORKING PROPERLY**! 

The automated test successfully:
- ✓ Found the MONGODB_URI environment variable
- ✓ Connected to the MongoDB database
- ✓ Listed collections (currently 0 collections, which is normal for a new database)
- ✓ Closed the connection gracefully

---

## 📋 Step-by-Step Instructions to Test Database Connection Yourself

### Method 1: Using the Test Script (Recommended)

1. **Open Terminal/PowerShell** in your project directory:
   ```
   cd c:\Users\Acer\OneDrive\Desktop\stock_test
   ```

2. **Run the test script**:
   ```
   node test-db-connection.js
   ```

3. **Expected Output** (if successful):
   ```
   🔍 Testing MongoDB Connection...
   
   Environment: development
   MongoDB URI: ✓ Found
   
   ⏳ Attempting to connect to MongoDB...
   
   ✅ SUCCESS: Connected to MongoDB!
   Database Name: [your-database-name]
   Host: [your-host]
   Port: [your-port]
   Connection State: Connected
   
   ⏳ Testing database operations...
   ✅ Found X collection(s) in database:
      - [collection names if any]
   
   ✅ Database connection test completed successfully!
   
   🔌 Connection closed.
   ```

4. **If you see errors**, the script will provide troubleshooting tips specific to your error.

---

### Method 2: Using MongoDB Compass (GUI Tool)

1. **Download MongoDB Compass** (if not already installed):
   - Visit: https://www.mongodb.com/try/download/compass
   - Download and install the appropriate version for Windows

2. **Get your connection string**:
   - Your connection string is stored in the `.env` file
   - It looks like: `mongodb://localhost:27017/database-name` or `mongodb+srv://...`

3. **Connect using Compass**:
   - Open MongoDB Compass
   - Paste your connection string in the connection field
   - Click "Connect"
   - If successful, you'll see your database and collections

---

### Method 3: Using MongoDB Shell (mongosh)

1. **Install MongoDB Shell** (if not already installed):
   - Visit: https://www.mongodb.com/try/download/shell
   - Download and install mongosh

2. **Connect to your database**:
   ```bash
   mongosh "your-connection-string-here"
   ```

3. **Test basic commands**:
   ```javascript
   // Show all databases
   show dbs
   
   // Use your database
   use your-database-name
   
   // Show collections
   show collections
   
   // Test insert
   db.test.insertOne({ message: "Hello from mongosh!" })
   
   // Test query
   db.test.find()
   
   // Clean up test
   db.test.deleteMany({})
   ```

---

### Method 4: Test Within Your Next.js Application

1. **Create a test API route** at `app/api/test-db/route.ts`:

   ```typescript
   import { NextResponse } from 'next/server';
   import { connectToDatabase } from '@/database/mongoose';
   import mongoose from 'mongoose';

   export async function GET() {
       try {
           await connectToDatabase();
           
           const dbName = mongoose.connection.name;
           const collections = await mongoose.connection.db.listCollections().toArray();
           
           return NextResponse.json({
               success: true,
               message: 'Database connection successful!',
               database: dbName,
               collections: collections.map(c => c.name),
               connectionState: mongoose.connection.readyState
           });
       } catch (error: any) {
           return NextResponse.json({
               success: false,
               error: error.message
           }, { status: 500 });
       }
   }
   ```

2. **Start your development server**:
   ```bash
   npm run dev
   ```

3. **Visit the test endpoint** in your browser:
   ```
   http://localhost:3000/api/test-db
   ```

4. **Expected Response** (if successful):
   ```json
   {
     "success": true,
     "message": "Database connection successful!",
     "database": "your-database-name",
     "collections": ["collection1", "collection2"],
     "connectionState": 1
   }
   ```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "MONGODB_URI is not defined"
**Solution:**
- Check that your `.env` file exists in the project root
- Ensure it contains: `MONGODB_URI=your-connection-string`
- Restart your development server after adding/modifying `.env`

### Issue 2: "ECONNREFUSED" Error
**Solution:**
- Ensure MongoDB is running on your system
- For local MongoDB: Start the MongoDB service
  - Windows: `net start MongoDB` (run as Administrator)
  - Or use MongoDB Compass to start it
- Check if the port (default: 27017) is correct

### Issue 3: "Authentication Failed"
**Solution:**
- Verify your username and password in the connection string
- Ensure the database user has proper permissions
- For MongoDB Atlas: Check IP whitelist settings

### Issue 4: "Network Timeout"
**Solution:**
- Check your internet connection (for cloud databases)
- Verify firewall settings aren't blocking the connection
- For MongoDB Atlas: Ensure your IP is whitelisted

---

## 🔍 Understanding Connection States

MongoDB connection states:
- `0` = Disconnected
- `1` = Connected
- `2` = Connecting
- `3` = Disconnecting

---

## 📝 Additional Notes

### Code Improvements Made:
1. ✅ Fixed typo in error message (line 19): `MONGODC_URI` → `MONGODB_URI`
2. ✅ Added return statement to `connectToDatabase()` function for proper type safety

### Your Current Setup:
- Database connection file: `database/mongoose.ts`
- Uses connection caching for optimal performance
- Properly configured for Next.js serverless functions
- Environment variable: `MONGODB_URI` (stored in `.env`)

---

## 🎯 Next Steps

Now that your database connection is working:

1. **Create your database models** in `lib/database/models/`
2. **Set up API routes** to interact with your database
3. **Implement CRUD operations** for your application
4. **Add proper error handling** for production use
5. **Consider adding database indexes** for better performance

---

## 📚 Useful Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud database hosting

---

**Last Updated:** December 26, 2025
**Status:** ✅ Connection Verified and Working
