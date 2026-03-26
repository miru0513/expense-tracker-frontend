import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Tag, 
  LogOut,
  Layout 
} from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import AddExpense from "../components/AddExpense";
import ExpenseDetail from "../components/ExpenseDetail";
import { setCookie, getCookie } from "../utils/cookies";
import Statistics from "../components/Statistics"; 
import Categories from "../components/Categories";
import Overview from "../components/Overview"; 

const categoryBadges = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Bills: 'bg-red-100 text-red-700',
  Health: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-700',
};

// ADDED: Props to receive trip information from App.jsx
function Home({ mode, activeTrip, goBack }) {
  // Use trip ID as the storage key if in trip mode, otherwise 'basic'
  const storageKey = mode === 'basic' ? 'basic' : activeTrip?.id;
  
  const {
    currentTransactions, transactions, selected, setSelected, isAdding, setIsAdding,
    currentPage, setCurrentPage, totalPages, totals, addTransaction, updateTransaction,
    deleteTransaction, itemsPerPage
  } = useTransactions(storageKey); // Pass storageKey here

  const [visitCount, setVisitCount] = useState(1);
  const [lastActive, setLastActive] = useState('Just now');
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const [isViewingOverview, setIsViewingOverview] = useState(false);
  const [isViewingStats, setIsViewingStats] = useState(false);
  const [isViewingCategories, setIsViewingCategories] = useState(false);

  useEffect(() => {
    const savedVisits = parseInt(getCookie('visit_count') || '0');
    const savedLastActive = getCookie('last_active') || 'First time';
    const savedPrivacy = getCookie('privacy_preference') === 'true';

    const newVisitCount = savedVisits + 1;
    setVisitCount(newVisitCount);
    setLastActive(savedLastActive);
    setPrivacyMode(savedPrivacy);

    setCookie('visit_count', newVisitCount, 7);
    setCookie('last_active', new Date().toLocaleString(), 7);
  }, []);

  const togglePrivacy = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    setCookie('privacy_preference', newMode, 7);
  };

  const goToDashboard = () => {
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
    setIsViewingStats(false);
    setIsViewingCategories(false);
  };

  const goToOverview = () => {
    setIsViewingOverview(true);
    setIsViewingStats(false);
    setIsViewingCategories(false);
    setIsAdding(false);
    setSelected(null);
  };

  const goToAddTransaction = () => {
    setIsAdding(true);
    setSelected(null);
    setIsViewingStats(false);
    setIsViewingCategories(false);
    setIsViewingOverview(false);
  };

  const goToStatistics = () => {
    setIsViewingStats(true);
    setIsViewingCategories(false);
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
  };

  const goToCategories = () => {
    setIsViewingCategories(true);
    setIsViewingStats(false);
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
  };

  const handleLogout = () => {
    window.location.href = '/';
  };

  // Dynamically set title based on current trip or basic mode
  const pageTitle = mode === 'basic' ? 'Welcome back! 👋' : `${activeTrip?.name} ✈️`;

  return (
    <div className="flex min-h-screen bg-[#2563eb] font-sans text-slate-900">
      
      <aside className="w-64 bg-[#151b2b] flex flex-col shadow-2xl z-10 shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/40">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">SmartSpend</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Track your expenses</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-2">
          <button 
            onClick={goToDashboard} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${!isAdding && !selected && !isViewingStats && !isViewingCategories && !isViewingOverview ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <button 
            onClick={goToAddTransaction} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isAdding ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Plus className="w-5 h-5" /> Add Transaction
          </button>

          <button 
            onClick={goToStatistics}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isViewingStats ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> Statistics
          </button>

          <button 
            onClick={goToCategories}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isViewingCategories ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Tag className="w-5 h-5" /> Categories
          </button>

          <button 
            onClick={goToOverview} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isViewingOverview ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Layout className="w-5 h-5" /> Overview
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          {/* ADDED: Button to go back to trip selection list */}
          <button 
            onClick={goBack}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white mb-2"
          >
            <ArrowLeft className="w-5 h-5" /> Exit to Trips
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {isViewingOverview ? (
          <Overview 
            transactions={transactions} 
            currentTransactions={currentTransactions}
            setSelected={setSelected}
          />
        ) : isViewingCategories ? (
          <Categories transactions={transactions} />
        ) : isViewingStats ? (
          <Statistics transactions={transactions} />
        ) : isAdding ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-4 overflow-hidden">
              <AddExpense onAdd={addTransaction} goBack={goToDashboard} />
            </motion.div>
          </div>
        ) : selected ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl">
              <button onClick={goToDashboard} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
              </button>
              <ExpenseDetail expense={selected} onDelete={deleteTransaction} onUpdate={updateTransaction} />
            </motion.div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-10">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-4xl text-white font-bold mb-2">{pageTitle}</h1>
                <p className="text-blue-100 mb-2 text-lg">Here's what's happening with your money</p>
                <p className="text-xs text-blue-200/70 font-medium">
                  Visits: {visitCount} | Last active: {lastActive}
                </p>
              </motion.div>
              
              <div className="flex gap-3 mt-2">
                <button onClick={togglePrivacy} className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg transition-all" title="Toggle Privacy Mode">
                  {privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-3">Total Income</p>
                  <p className="text-5xl text-gray-900 font-bold">
                    {privacyMode ? '***' : `${totals.income.toFixed(0)}`} <span className="text-2xl text-gray-400 font-medium">lei</span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <TrendingUp className="text-white w-8 h-8" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-3">Total Expense</p>
                  <p className="text-5xl text-gray-900 font-bold">
                     {privacyMode ? '***' : `${totals.expense.toFixed(0)}`} <span className="text-2xl text-gray-400 font-medium">lei</span>
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <TrendingDown className="text-white w-8 h-8" />
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl text-gray-900 font-bold">Recent Transactions</h2>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-blue-300" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No transactions yet</p>
                  <p className="text-gray-400 text-sm mt-2">Use the menu on the left to add one!</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">
                          <th className="text-left py-4 px-4">Title</th>
                          <th className="text-left py-4 px-4">Category</th>
                          <th className="text-left py-4 px-4">Amount</th>
                          <th className="text-left py-4 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTransactions.map((t, index) => (
                          <motion.tr 
                            key={t.id} 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                            onClick={() => setSelected(t)} 
                            className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group"
                          >
                            <td className="py-6 px-4 text-sm text-gray-700 font-semibold">{t.title}</td>
                            <td className="py-6 px-4"><span className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wide ${categoryBadges[t.category] || categoryBadges['Other']}`}>{t.category}</span></td>
                            <td className={`py-6 px-4 text-base font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                              {privacyMode ? '***' : `${t.type === 'income' ? '+' : '-'}${t.amount.toFixed(0)} lei`}
                            </td>
                            <td className="py-6 px-4 text-sm text-gray-400 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">Page {currentPage} of {totalPages}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gray-50 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors">Prev</button>
                      <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gray-50 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors">Next</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;