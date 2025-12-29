import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/database/mongoose';
import Watchlist from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

// GET - Get user's watchlist
export async function GET() {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const watchlist = await Watchlist.find({ userId: session.user.id })
            .sort({ addedAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: watchlist });
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch watchlist' },
            { status: 500 }
        );
    }
}

// POST - Add to watchlist
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { symbol, company } = body;

        if (!symbol || !company) {
            return NextResponse.json(
                { error: 'Symbol and company are required' },
                { status: 400 }
            );
        }

        // Check if already exists
        const existing = await Watchlist.findOne({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Stock already in watchlist' },
                { status: 400 }
            );
        }

        // Add to watchlist
        const watchlistItem = await Watchlist.create({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
            company,
        });

        return NextResponse.json({
            success: true,
            message: 'Added to watchlist',
            data: watchlistItem,
        });
    } catch (error: any) {
        console.error('Error adding to watchlist:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'Stock already in watchlist' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to add to watchlist' },
            { status: 500 }
        );
    }
}

// DELETE - Remove from watchlist
export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const symbol = searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json(
                { error: 'Symbol is required' },
                { status: 400 }
            );
        }

        const result = await Watchlist.findOneAndDelete({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Stock not found in watchlist' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Removed from watchlist',
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to remove from watchlist' },
            { status: 500 }
        );
    }
}
