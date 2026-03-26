import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTransactions } from './useTransactions';

describe('useTransactions Logic Hook', () => {
  it('should add a transaction and update totals', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({ id: 1, type: 'income', amount: 100, title: 'Salary', category: 'Salary', date: '2026-03-20' });
    });
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.totals.income).toBe(100);
  });

  it('should handle pagination correctly', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      for (let i = 1; i <= 6; i++) {
        result.current.addTransaction({ id: i, amount: 10, type: 'expense', date: '2026-03-20', title: `Item ${i}`, category: 'Other' });
      }
    });
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentTransactions).toHaveLength(5);
  });

  it('should update an existing transaction', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({ id: 1, title: 'Old', amount: 10, type: 'expense' });
    });
    act(() => {
      result.current.updateTransaction({ id: 1, title: 'New', amount: 20, type: 'expense' });
    });
    expect(result.current.transactions[0].title).toBe('New');
  });

  it('does not update if id does not match', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({ id: 1, title: 'Test', amount: 10, type: 'expense' });
    });
    act(() => {
      result.current.updateTransaction({ id: 99, title: 'Non-existent' });
    });
    expect(result.current.transactions[0].title).toBe('Test');
  });

  it('should delete a transaction and adjust page if empty', () => {
    const { result } = renderHook(() => useTransactions());
    act(() => {
      result.current.addTransaction({ id: 1, amount: 50, type: 'expense', title: 'Test' });
    });
    act(() => {
      result.current.deleteTransaction(1);
    });
    expect(result.current.transactions).toHaveLength(0);
  });
});



  it('adjusts the current page if the last item on a page is deleted', () => {
    const { result } = renderHook(() => useTransactions());
    
    act(() => {
      
      for (let i = 1; i <= 6; i++) {
        result.current.addTransaction({ id: i, amount: 10, type: 'expense' });
      }
      result.current.setCurrentPage(2);
    });

    act(() => {
      result.current.deleteTransaction(6); 
    });

    expect(result.current.currentPage).toBe(1);
  });