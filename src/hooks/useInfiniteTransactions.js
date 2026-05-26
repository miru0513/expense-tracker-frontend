import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from '../utils/api';
import {
  getLocalTransactions, addLocalTransaction, updateLocalTransaction,
  deleteLocalTransaction, enqueue, flushQueue, getQueueLength,
} from '../utils/offlineQueue';

const LIMIT = 5;

export function useInfiniteTransactions(storageKey = 'basic', userId = null) {
  const tripId = storageKey === 'basic' ? null : storageKey;

  const [transactions, setTransactions]       = useState([]);
  const [totals, setTotals]                   = useState({ income: 0, expense: 0 });
  const [currentPage, setCurrentPage]         = useState(1);
  const [totalPages, setTotalPages]           = useState(1);
  const [loading, setLoading]                 = useState(false);
  const [loadingMore, setLoadingMore]         = useState(false);
  const [selected, setSelected]               = useState(null);
  const [isAdding, setIsAdding]               = useState(false);
  const [isOffline, setIsOffline]             = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const cache        = useRef({});
  const prefetching  = useRef(new Set());
  const totalPagesRef = useRef(1);
  const syncInterval  = useRef(null);

  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  const computeTotals = (list) => ({
    income:  list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  });

  const showLocal = useCallback(() => {
    const local = getLocalTransactions(storageKey);
    const sorted = [...local].sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(sorted.slice(0, LIMIT));
    setTotals(computeTotals(local));
    setTotalPages(Math.ceil(local.length / LIMIT) || 1);
    setCurrentPage(1);
  }, [storageKey]);

  const fetchPage = useCallback(async (page) => {
    if (cache.current[page]) return cache.current[page];
    const result = await api.fetchTransactions(page, LIMIT, tripId, userId);
    cache.current[page] = result.data;
    return result.data;
  }, [tripId, userId]);

  const prefetchPage = useCallback((page) => {
    if (page > totalPagesRef.current || cache.current[page] || prefetching.current.has(page)) return;
    prefetching.current.add(page);
    api.fetchTransactions(page, LIMIT, tripId, userId)
      .then(result => { cache.current[page] = result.data; prefetching.current.delete(page); })
      .catch(() => prefetching.current.delete(page));
  }, [tripId, userId]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    cache.current = {};
    prefetching.current.clear();
    try {
      const [result, stats] = await Promise.all([
        api.fetchTransactions(1, LIMIT, tripId, userId),
        api.fetchStatistics(tripId, userId),
      ]);
      cache.current[1] = result.data;
      setTransactions(result.data);
      setTotalPages(result.pagination.totalPages);
      totalPagesRef.current = result.pagination.totalPages;
      setCurrentPage(1);
      setTotals({ income: stats.totalIncome, expense: stats.totalExpense });
      setIsOffline(false);
      setPendingSyncCount(0);
      prefetchPage(2);
      }  catch (err) {
  console.error('REAL ERROR:', err.message);
  // Only go offline if it's actually a network error
  if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
    setIsOffline(true);
    showLocal();
  }
  // Otherwise just log it - don't go offline
} finally {

      setLoading(false);
    }
  }, [tripId, userId, prefetchPage, showLocal]);

  const trySyncAndReload = useCallback(async () => {
    const reachable = await api.isServerReachable();
    if (!reachable) return;
    if (getQueueLength() > 0) {
      await flushQueue({ createTransaction: api.createTransaction, updateTransaction: api.updateTransaction, deleteTransaction: api.deleteTransaction });
    }
    setPendingSyncCount(0);
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (isOffline) { syncInterval.current = setInterval(trySyncAndReload, 5000); }
    else { clearInterval(syncInterval.current); }
    return () => clearInterval(syncInterval.current);
  }, [isOffline, trySyncAndReload]);

  useEffect(() => {
    const handler = () => trySyncAndReload();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [trySyncAndReload]);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= totalPagesRef.current) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const data = await fetchPage(nextPage);
      setTransactions(prev => { const seen = new Set(prev.map(t => t.id)); return [...prev, ...data.filter(t => !seen.has(t.id))]; });
      setCurrentPage(nextPage);
      prefetchPage(nextPage + 1);
    } catch { setIsOffline(true); }
    finally { setLoadingMore(false); }
  }, [loadingMore, currentPage, fetchPage, prefetchPage]);

  const addTransaction = async (t) => {
    const local = { ...t, tripId, userId, id: `local-${Date.now()}` };
    addLocalTransaction(local, storageKey);
    setIsAdding(false);
    if (isOffline) {
      enqueue({ method: 'POST', body: { ...t, tripId, userId } });
      setPendingSyncCount(getQueueLength());
      showLocal();
    } else {
      try {
        await api.createTransaction({ ...t, tripId, userId });
        await loadInitial();
      } catch {
        setIsOffline(true);
        enqueue({ method: 'POST', body: { ...t, tripId, userId } });
        setPendingSyncCount(getQueueLength());
      }
    }
  };

  const updateTransaction = async (updated) => {
    updateLocalTransaction(updated, storageKey);
    setSelected(null);
    if (isOffline) {
      enqueue({ method: 'PUT', targetId: updated.id, body: updated });
      setPendingSyncCount(getQueueLength());
      showLocal();
    } else {
      try { await api.updateTransaction(updated.id, { ...updated, userId }); await loadInitial(); }
      catch { setIsOffline(true); enqueue({ method: 'PUT', targetId: updated.id, body: updated }); setPendingSyncCount(getQueueLength()); }
    }
  };

  const deleteTransaction = async (id) => {
    deleteLocalTransaction(id, storageKey);
    setSelected(null);
    if (isOffline) {
      enqueue({ method: 'DELETE', targetId: id });
      setPendingSyncCount(getQueueLength());
      showLocal();
    } else {
      try { await api.deleteTransaction(id); await loadInitial(); }
      catch { setIsOffline(true); enqueue({ method: 'DELETE', targetId: id }); setPendingSyncCount(getQueueLength()); }
    }
  };

  return {
    transactions, currentTransactions: transactions, totals,
    currentPage, totalPages, loading, loadingMore,
    isOffline, pendingSyncCount,
    selected, setSelected, isAdding, setIsAdding,
    loadMore, loadFromServer: loadInitial,
    addTransaction, updateTransaction, deleteTransaction,
    itemsPerPage: LIMIT,
  };
}