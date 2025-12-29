'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WatchlistButtonProps {
    symbol: string;
    company: string;
    isInWatchlist?: boolean;
}

const WatchlistButton = ({ symbol, company, isInWatchlist = false }: WatchlistButtonProps) => {
    const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleWatchlist = async () => {
        setIsLoading(true);
        try {
            if (inWatchlist) {
                // Remove from watchlist
                const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to remove from watchlist');
                }

                setInWatchlist(false);
                toast.success(`${symbol} removed from watchlist`);
            } else {
                // Add to watchlist
                const response = await fetch('/api/watchlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ symbol, company }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add to watchlist');
                }

                setInWatchlist(true);
                toast.success(`${symbol} added to watchlist`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update watchlist');
            console.error('Watchlist error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleToggleWatchlist}
            disabled={isLoading}
            variant={inWatchlist ? 'outline' : 'default'}
            className={`w-full ${inWatchlist
                    ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {inWatchlist ? 'Removing...' : 'Adding...'}
                </>
            ) : inWatchlist ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    In Watchlist
                </>
            ) : (
                <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                </>
            )}
        </Button>
    );
};

export default WatchlistButton;
