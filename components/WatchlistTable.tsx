'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { toast } from "sonner";

const WatchlistTable = () => {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

    const fetchWatchlist = async () => {
        try {
            const response = await fetch('/api/watchlist');
            const data = await response.json();

            if (response.ok && data.success) {
                setWatchlist(data.data);
            } else {
                toast.error('Failed to load watchlist');
            }
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            toast.error('Failed to load watchlist');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (symbol: string) => {
        setRemovingSymbol(symbol);
        try {
            const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setWatchlist(watchlist.filter(item => item.symbol !== symbol));
                toast.success(`${symbol} removed from watchlist`);
            } else {
                toast.error(data.error || 'Failed to remove from watchlist');
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            toast.error('Failed to remove from watchlist');
        } finally {
            setRemovingSymbol(null);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Your watchlist is empty</p>
                <p className="text-gray-500 text-sm mt-2">
                    Search for stocks and add them to your watchlist
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        {WATCHLIST_TABLE_HEADER.map((header) => (
                            <TableHead key={header} className="text-left">
                                {header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {watchlist.map((item) => (
                        <TableRow key={item.symbol}>
                            <TableCell className="text-left">{item.company}</TableCell>
                            <TableCell className="text-left font-semibold">{item.symbol}</TableCell>
                            <TableCell className="text-left">-</TableCell>
                            <TableCell className="text-left">-</TableCell>
                            <TableCell className="text-left">-</TableCell>
                            <TableCell className="text-left">-</TableCell>
                            <TableCell className="text-left">-</TableCell>
                            <TableCell className="text-left">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(item.symbol)}
                                    disabled={removingSymbol === item.symbol}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                    {removingSymbol === item.symbol ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default WatchlistTable;
