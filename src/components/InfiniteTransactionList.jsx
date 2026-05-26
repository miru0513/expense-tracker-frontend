import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const categoryBadges = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Bills: 'bg-red-100 text-red-700',
  Health: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-700',
};

export default function InfiniteTransactionList({
  transactions,
  currentPage,
  totalPages,
  loadingMore,
  loading,
  privacyMode,
  onSelect,
  loadMore,
}) {
  // Sentinel div at the bottom — IntersectionObserver watches it
  const sentinelRef = useRef(null);
  const loadMoreRef = useRef(loadMore);
  useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current();
        }
      },
      {
        root: null,
        // Start loading when sentinel is 200px from viewport bottom (prefetch feel)
        rootMargin: '0px 0px 200px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-white/70 text-sm">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center sm:py-16">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <svg className="h-10 w-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-500">No transactions yet</p>
        <p className="mt-2 text-sm text-gray-400">Use the menu to add one.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr className="border-b-2 border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-4 text-left">Title</th>
              <th className="px-4 py-4 text-left">Category</th>
              <th className="px-4 py-4 text-left">Amount</th>
              <th className="px-4 py-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                onClick={() => onSelect(t)}
                className="group cursor-pointer border-b border-gray-50 transition-colors hover:bg-blue-50"
              >
                <td className="px-4 py-5 text-sm font-semibold text-gray-700 sm:py-6">
                  {t.title}
                </td>
                <td className="px-4 py-5 sm:py-6">
                  <span className={`inline-block rounded-md px-3 py-1.5 text-xs font-bold tracking-wide ${categoryBadges[t.category] || categoryBadges.Other}`}>
                    {t.category}
                  </span>
                </td>
                <td className={`px-4 py-5 text-sm font-bold sm:py-6 sm:text-base ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {privacyMode ? '***' : `${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(0)} lei`}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-gray-400 sm:py-6">
                  {new Date(t.date).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scroll sentinel — IntersectionObserver watches this */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner for more pages */}
      {loadingMore && (
        <div className="py-6 text-center">
          <div className="inline-block w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="mt-2 text-xs text-gray-400">Loading more...</p>
        </div>
      )}

      {/* End of list indicator */}
      {!loadingMore && currentPage >= totalPages && transactions.length > 0 && (
        <div className="py-6 text-center border-t border-gray-100 mt-4">
          <p className="text-xs text-gray-400">
            All {transactions.length} transactions loaded
          </p>
        </div>
      )}
    </>
  );
}