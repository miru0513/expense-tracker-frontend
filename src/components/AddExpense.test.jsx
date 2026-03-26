import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddExpense from './AddExpense';

describe('AddExpense Validation', () => {
  it('validates title length', async () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Transaction name/i), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText(/Save Transaction/i));
    expect(await screen.findByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
  });

  it('validates positive amount', async () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
   
    fireEvent.change(screen.getByPlaceholderText(/Transaction name/i), { target: { value: 'Valid Title' } });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '0' } });
    fireEvent.click(screen.getByText(/Save Transaction/i));
    expect(await screen.findByText(/Amount must be a positive number/i)).toBeInTheDocument();
  });

  it('switches to income categories', () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
    fireEvent.click(screen.getByText('Income'));
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('validates missing date', async () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
    
    
    fireEvent.change(screen.getByPlaceholderText(/Transaction name/i), { target: { value: 'Valid' } });
    
    
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });
    
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(screen.getByDisplayValue(today), { target: { value: '' } });
    
   
    fireEvent.click(screen.getByText(/Save Transaction/i));
    
  
    expect(await screen.findByText(/Please select a valid date/i)).toBeInTheDocument();
  });
});



  it('covers the explicit error state reset when type changes', () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
    
    
    const submitBtn = screen.getByText(/Save Transaction/i);
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();

   
    const incomeBtn = screen.getByText('Income');
    fireEvent.click(incomeBtn);
    expect(screen.queryByText(/Title must be at least 3 characters/i)).not.toBeInTheDocument();
  });

  it('updates the category when a user selects a different one', () => {
    render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
    const select = screen.getByRole('combobox');
    
    fireEvent.change(select, { target: { value: 'Transport' } });
    expect(select.value).toBe('Transport');
  });


it('clears error messages and resets category when toggling type', () => {
  render(<AddExpense onAdd={vi.fn()} goBack={vi.fn()} />);
  
  
  fireEvent.click(screen.getByText(/Save Transaction/i));
  expect(screen.getByText(/Title must be at least 3 characters/i)).toBeInTheDocument();

 
  fireEvent.click(screen.getByText('Income'));
  
  
  expect(screen.queryByText(/Title must be at least 3 characters/i)).not.toBeInTheDocument();
  
  expect(screen.getByDisplayValue('Salary')).toBeInTheDocument();
});