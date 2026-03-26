import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExpenseDetail from './ExpenseDetail';

//mock daat
const mockExpense = { 
  id: 1, 
  title: 'Coffee', 
  amount: 15, 
  type: 'expense', 
  category: 'Food', 
  date: '2026-03-20' 
};

describe('ExpenseDetail Component', () => {

  it('renders expense details correctly', () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const deleteSpy = vi.fn();
    render(<ExpenseDetail expense={mockExpense} onDelete={deleteSpy} onUpdate={vi.fn()} />);
    
    fireEvent.click(screen.getByText(/Delete/i));
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it('switches to edit mode when edit button is clicked', () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByText(/Edit/i));
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  it('updates transaction details when saved', () => {
    const updateSpy = vi.fn();
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={updateSpy} />);
    
   
    fireEvent.click(screen.getByText(/Edit/i));
    
    
    const titleInput = screen.getByDisplayValue('Coffee');
    fireEvent.change(titleInput, { target: { value: 'Tea' } });
    
    
    fireEvent.click(screen.getByText(/Save Changes/i));
    
    
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'Tea' }));
  });
});



  it('closes edit mode without saving when X is clicked', () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
    fireEvent.click(screen.getByText(/Edit/i));
    
    const closeBtn = screen.getByRole('button', { name: '' }); 
    fireEvent.click(closeBtn);
    
    expect(screen.queryByText(/Save Changes/i)).not.toBeInTheDocument();
  });

  it('shows validation error in edit mode for invalid amount', async () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
    fireEvent.click(screen.getByText(/Edit/i));
    const amountInput = screen.getByDisplayValue('15');
    
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(await screen.findByText(/Amount must be greater than 0/i)).toBeInTheDocument();
  });

 

  it('updates type and category in edit mode', () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
    fireEvent.click(screen.getByText(/Edit/i));
    
    
    const incomeBtn = screen.getByText('Income');
    fireEvent.click(incomeBtn);
    
  
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('shows an error if the title is cleared in edit mode', async () => {
    render(<ExpenseDetail expense={mockExpense} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
    fireEvent.click(screen.getByText(/Edit/i));
    const titleInput = screen.getByDisplayValue('Coffee');
    
    fireEvent.change(titleInput, { target: { value: '  ' } }); 
    fireEvent.click(screen.getByText(/Save Changes/i));

    expect(await screen.findByText(/Title must be at least 3 characters/i)).toBeInTheDocument();
  });



  it('renders income styling correctly for coverage', () => {
    const incomeMock = { ...mockExpense, type: 'income', amount: 100 };
    render(<ExpenseDetail expense={incomeMock} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    
  
    expect(screen.getByText(/\+100/)).toBeInTheDocument();
  });

  

