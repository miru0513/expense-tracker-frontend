import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';
import * as transactionsHook from '../hooks/useTransactions';

const globalMockData = {
  transactions: [{ id: 1, title: 'Rent', amount: 500, type: 'expense', category: 'Bills', date: '2026-03-20' }],
  currentTransactions: [{ id: 1, title: 'Rent', amount: 500, type: 'expense', category: 'Bills', date: '2026-03-20' }],
  totals: { income: 0, expense: 500 },
  currentPage: 1,
  totalPages: 1,
  isAdding: false,
  selected: null,
  itemsPerPage: 5,
  setSelected: vi.fn(),
  setIsAdding: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  setCurrentPage: vi.fn(),
};

describe('Home Page Visuals', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dashboard correctly', () => {
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue(globalMockData);
    render(<Home />);
    expect(screen.getByText('500 lei')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('calls setIsAdding on click', () => {
    const spy = vi.fn();
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({ ...globalMockData, setIsAdding: spy });
    render(<Home />);
    fireEvent.click(screen.getByText(/Add Transaction/i));
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('navigates to previous page', () => {
    const spy = vi.fn();
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({ ...globalMockData, totalPages: 2, currentPage: 2, setCurrentPage: spy });
    render(<Home />);
    fireEvent.click(screen.getByText(/Prev/i));
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('renders detail view when selected', () => {
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({ ...globalMockData, selected: globalMockData.transactions[0] });
    render(<Home />);
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });
});



  it('renders empty state when there are no transactions', () => {
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
      ...globalMockData,
      transactions: [],
      currentTransactions: []
    });

    render(<Home />);
    expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
  });

  it('disables the Next button on the last page', () => {
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
      ...globalMockData,
      totalPages: 1,
      currentPage: 1
    });

    render(<Home />);
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).toBeDisabled();
  });



  it('navigates to previous page and covers navigation logic', () => {
    const setCurrentPageSpy = vi.fn();
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
      ...globalMockData,
      totalPages: 2,
      currentPage: 2,
      setCurrentPage: setCurrentPageSpy,
      transactions: Array(6).fill({}) 
    });

    render(<Home />);
    
    
    const prevBtn = screen.getByText(/Prev/i);
    fireEvent.click(prevBtn);
    expect(setCurrentPageSpy).toHaveBeenCalledWith(1);
  });

  it('covers the empty list display logic', () => {
    vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
      ...globalMockData,
      transactions: [],
      currentTransactions: []
    });

    render(<Home />);
    expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
  });

  

it('shows the empty state message when no transactions exist', () => {
  vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
    ...globalMockData,
    transactions: [],
    currentTransactions: [],
    totalPages: 0
  });

  render(<Home />);
 
  expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
});

it('disables the Next button when on the last page', () => {
  vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
    ...globalMockData,
    currentPage: 1,
    totalPages: 1 
  });

  render(<Home />);
  const nextBtn = screen.getByText(/Next/i);
  
  expect(nextBtn).toBeDisabled();
});

it('navigates to next page when button is clicked', () => {
  const setCurrentPageSpy = vi.fn();
  vi.spyOn(transactionsHook, 'useTransactions').mockReturnValue({
    ...globalMockData,
    currentPage: 1,
    totalPages: 2,
    setCurrentPage: setCurrentPageSpy
  });

  render(<Home />);
  const nextBtn = screen.getByText(/Next/i);
  fireEvent.click(nextBtn);
  expect(setCurrentPageSpy).toHaveBeenCalledWith(2);
});

