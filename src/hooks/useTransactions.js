import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../utils/api';
import {
  getLocalTransactions,
  addLocalTransaction,
  updateLocalTransaction,
  deleteLocalTransaction,
  enqueue,
  flushQueue,
  getQueueLength,
  onSync,
} from '../utils/offlineQueue';

export function useTransactions(storageKey = 'basic') {
  const tripId = storageKey === 'basic' ? null : storageKey;

  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const itemsPerPage = 5;
  const syncIntervalRef = useRef(null);

  const computeTotals = (list) => ({
    income: list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  });

  const paginateLocal = (list, page) => {
    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    const total = sorted.length;
    const pages = Math.ceil(total / itemsPerPage) || 1;
    const data = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return { data, pages };
  };

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    try {
      const [result, stats] = await Promise.all([
        api.fetchTransactions(currentPage, itemsPerPage, tripId),
        api.fetchStatistics(tripId),
      ]);
      setTransactions(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotals({ income: stats.totalIncome, expense: stats.totalExpense });
      setIsOffline(false);
    } catch {
      setIsOffline(true);
      const local = getLocalTransactions(storageKey);
      const { data, pages } = paginateLocal(local, currentPage);
      setTransactions(data);
      setTotalPages(pages);
      setTotals(computeTotals(local));
    } finally {
      setLoading(false);
    }
  }, [currentPage, tripId, storageKey]);

  const trySyncAndReload = useCallback(async () => {
    const reachable = await api.isServerReachable();
    if (!reachable) return;
    if (getQueueLength() > 0) {
      await flushQueue({
        createTransaction: api.createTransaction,
        updateTransaction: api.updateTransaction,
        deleteTransaction: api.deleteTransaction,
      });
      setPendingSyncCount(0);
    }
    setIsOffline(false);
    await loadFromServer();
  }, [loadFromServer]);

  useEffect(() => {
    if (isOffline) {
      syncIntervalRef.current = setInterval(trySyncAndReload, 5000);
    } else {
      clearInterval(syncIntervalRef.current);
    }
    return () => clearInterval(syncIntervalRef.current);
  }, [isOffline, trySyncAndReload]);

  useEffect(() => {
    const handleOnline = () => trySyncAndReload();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [trySyncAndReload]);

  useEffect(() => {
    onSync(() => {
      setPendingSyncCount(0);
      loadFromServer();
    });
  }, [loadFromServer]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const addTransaction = async (t) => {
    const transaction = { ...t, tripId, id: `local-${Date.now()}` };
    addLocalTransaction(transaction, storageKey);
    setIsAdding(false);
    if (isOffline) {
      enqueue({ method: 'POST', body: { ...t, tripId } });
      setPendingSyncCount(getQueueLength());
      const local = getLocalTransactions(storageKey);
      const { data, pages } = paginateLocal(local, currentPage);
      setTransactions(data);
      setTotalPages(pages);
      setTotals(computeTotals(local));
    } else {
      try {
        await api.createTransaction({ ...t, tripId });
        await loadFromServer();
      } catch {
        setIsOffline(true);
        enqueue({ method: 'POST', body: { ...t, tripId } });
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
      const local = getLocalTransactions(storageKey);
      const { data, pages } = paginateLocal(local, currentPage);
      setTransactions(data);
      setTotalPages(pages);
      setTotals(computeTotals(local));
    } else {
      try {
        await api.updateTransaction(updated.id, updated);
        await loadFromServer();
      } catch {
        setIsOffline(true);
        enqueue({ method: 'PUT', targetId: updated.id, body: updated });
        setPendingSyncCount(getQueueLength());
      }
    }
  };

  const deleteTransaction = async (id) => {
    deleteLocalTransaction(id, storageKey);
    setSelected(null);
    if (isOffline) {
      enqueue({ method: 'DELETE', targetId: id });
      setPendingSyncCount(getQueueLength());
      const local = getLocalTransactions(storageKey);
      const { data, pages } = paginateLocal(local, currentPage);
      setTransactions(data);
      setTotalPages(pages);
      setTotals(computeTotals(local));
    } else {
      try {
        await api.deleteTransaction(id);
        await loadFromServer();
      } catch {
        setIsOffline(true);
        enqueue({ method: 'DELETE', targetId: id });
        setPendingSyncCount(getQueueLength());
      }
    }
  };

  return {
    transactions,
    currentTransactions: transactions,
    selected, setSelected,
    isAdding, setIsAdding,
    currentPage, setCurrentPage,
    totalPages,
    totals,
    loading,
    isOffline,
    pendingSyncCount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    itemsPerPage,
    loadFromServer,
  };
}