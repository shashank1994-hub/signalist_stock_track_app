'use server';

import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

/**
 * Get all watchlist symbols for a user by their email
 * @param email - User's email address
 * @returns Array of stock symbols (uppercase)
 */
export const getWatchlistSymbolsByEmail = async (email: string): Promise<string[]> => {
    try {
        // Connect to database
        await connectToDatabase();

        // Find user by email using Better Auth
        const session = await auth.api.getSession({ headers: await headers() });

        // Alternative: Query user collection directly if session doesn't have the user
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) {
            console.error('Database connection not established');
            return [];
        }

        // Find user in Better Auth's user collection
        const userCollection = db.collection('user');
        const user = await userCollection.findOne({ email });

        if (!user) {
            console.log(`No user found with email: ${email}`);
            return [];
        }

        // Query watchlist by userId
        const watchlistItems = await Watchlist.find({ userId: user.id }).select('symbol').lean();

        // Extract and return just the symbols
        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error('Error fetching watchlist symbols:', error);
        return [];
    }
};

/**
 * Get all watchlist symbols for the currently authenticated user
 * @returns Array of stock symbols (uppercase)
 */
export const getWatchlistSymbols = async (): Promise<string[]> => {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            console.log('No authenticated user found');
            return [];
        }

        const watchlistItems = await Watchlist.find({ userId: session.user.id })
            .select('symbol')
            .lean();

        return watchlistItems.map((item) => item.symbol);
    } catch (error) {
        console.error('Error fetching watchlist symbols:', error);
        return [];
    }
};

/**
 * Check if a symbol is in the user's watchlist
 * @param symbol - Stock symbol to check
 * @returns Boolean indicating if symbol is in watchlist
 */
export const isInWatchlist = async (symbol: string): Promise<boolean> => {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return false;
        }

        const item = await Watchlist.findOne({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });

        return !!item;
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return false;
    }
};
