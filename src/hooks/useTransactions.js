import { useState } from "react";

// RAM Storage for various buckets (Basic vs Trips)
const globalStorage = {
  basic: [],
};

export function useTransactions(storageKey = 'basic') {
  // Initialize from bucket if exists, else empty
  const [transactions, setTransactions] = useState(globalStorage[storageKey] || []);
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const save = (newList) => {
    globalStorage[storageKey] = newList;
    setTransactions(newList);
  };

  const addTransaction = (t) => {
    save([...transactions, t]);
    setIsAdding(false);
  };

  const updateTransaction = (updated) => {
    save(transactions.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(null);
  };

  const deleteTransaction = (id) => {
    save(transactions.filter((t) => t.id !== id));
    setSelected(null);
  };

  const totals = {
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expense: transactions.filter(t => t.type === 'expense' || !t.type).reduce((sum, t) => sum + t.amount, 0)
  };

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pagedData = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    transactions,
    currentTransactions: pagedData,
    selected, setSelected,
    isAdding, setIsAdding,
    currentPage, setCurrentPage,
    totalPages: Math.ceil(sorted.length / itemsPerPage) || 1,
    totals,
    addTransaction, updateTransaction, deleteTransaction,
    itemsPerPage
  };
}