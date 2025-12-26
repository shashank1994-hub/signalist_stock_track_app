import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/database/mongoose';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDatabase();

        // Ensure the database connection is established
        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }

        const dbName = mongoose.connection.name;
        const collections = await mongoose.connection.db.listCollections().toArray();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            database: dbName,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            collections: collections.map(c => c.name),
            collectionCount: collections.length,
            connectionState: mongoose.connection.readyState,
            connectionStateText: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
