import { useState } from "react";
import { Trash2, Edit2, Save, X, Calendar, Tag, Type, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Gifts', 'Investments', 'Refund', 'Other'];

function ExpenseDetail({ expense, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState(expense.type || 'expense');
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category || 'Other');
  const [date, setDate] = useState(expense.date);
  const [editError, setEditError] = useState('');

  if (!expense) return null;

  const isIncome = expense.type === 'income';
  const currentCategories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    
    if (title.trim().length < 3) {
      setEditError('Title must be at least 3 characters.');
      return;
    }
    if (parseFloat(amount) <= 0 || !amount) {
      setEditError('Amount must be greater than 0.');
      return;
    }

    setEditError('');
    onUpdate({
      ...expense,
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col items-center justify-center py-6 border-b border-gray-100">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${isIncome ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30' : 'bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/30'}`}>
            {isIncome ? <TrendingUp className="w-8 h-8 text-white" /> : <TrendingDown className="w-8 h-8 text-white" />}
          </div>
          <p className="text-gray-500 uppercase tracking-wider text-sm font-semibold mb-1">
            {isIncome ? 'Income' : 'Expense'}
          </p>
          <h2 className={`text-5xl font-bold ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
            {isIncome ? '+' : '-'}{expense.amount.toFixed(0)} <span className="text-2xl text-gray-400">lei</span>
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-gray-500 flex items-center gap-2"><Type className="w-4 h-4" /> Title</span>
            <span className="font-medium text-gray-900">{expense.title}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Category</span>
            <span className="font-medium text-gray-900 bg-white px-3 py-1 rounded-full shadow-sm">{expense.category || 'Other'}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</span>
            <span className="font-medium text-gray-900">
              {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button onClick={() => setIsEditing(true)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <Edit2 className="w-5 h-5" /> Edit
          </button>
          <button onClick={() => onDelete(expense.id)} className="flex-1 py-4 bg-red-50 text-red-600 font-semibold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-5 h-5" /> Delete
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Transaction</h2>
        <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {editError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="w-4 h-4" /> {editError}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
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
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" required />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Amount (lei)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" required />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Category</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl appearance-none focus:ring-2 focus:ring-violet-600 outline-none">
              {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none" required />
          </div>
        </div>

        <button type="submit" className="w-full bg-violet-600 text-white font-medium py-4 rounded-2xl hover:bg-violet-700 flex justify-center gap-2 items-center mt-4">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </form>
    </motion.div>
  );
}

export default ExpenseDetail;