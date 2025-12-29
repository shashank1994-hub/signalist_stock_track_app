import WatchlistTable from '@/components/WatchlistTable';

export default function WatchlistPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-100 mb-2">
                    My Watchlist
                </h1>
                <p className="text-gray-400">
                    Track your favorite stocks and monitor their performance
                </p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
                <WatchlistTable />
            </div>
        </div>
    );
}
