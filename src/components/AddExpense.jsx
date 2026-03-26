import { useState } from 'react';
import { ArrowLeft, DollarSign, Tag, Calendar, Type, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Gifts', 'Investments', 'Refund', 'Other'];

function AddExpense({ onAdd, goBack }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(''); 

  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    //data validation
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }
    if (parseFloat(amount) <= 0 || !amount) {
      setError('Amount must be a positive number greater than 0.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setError(''); 
    onAdd({
      id: Date.now(),
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Add Transaction</h1>
          <div className="w-10" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-md mx-auto">
        
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
            <button type="button" onClick={() => handleTypeChange('expense')} className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Expense
            </button>
            <button type="button" onClick={() => handleTypeChange('income')} className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Name</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Transaction name" className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Amount (lei)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none appearance-none cursor-pointer">
                {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full bg-violet-600 text-white font-medium py-4 rounded-2xl hover:bg-violet-700 transition-colors mt-8 shadow-lg shadow-violet-500/20">
            Save Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AddExpense;