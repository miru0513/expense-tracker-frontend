import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Plus, ArrowLeft, Eye, EyeOff,
  LayoutDashboard, BarChart3, Wallet, Tag, LogOut, Layout,
  Menu, X, Zap, MessageCircle, Shield, Key,
} from "lucide-react";
import { useInfiniteTransactions } from "../hooks/useInfiniteTransactions";
import AddExpense from "../components/AddExpense";
import ExpenseDetail from "../components/ExpenseDetail";
import InfiniteTransactionList from "../components/InfiniteTransactionList";
import { setCookie, getCookie } from "../utils/cookies";
import Statistics from "../components/Statistics";
import Categories from "../components/Categories";
import Overview from "../components/Overview";
import GeneratorPanel from "../components/GeneratorPanel";
import ChatPanel from "../components/ChatPanel";
import AdminPanel from "../components/AdminPanel";
import SessionPanel from "../components/SessionPanel";

function Home({ mode, activeTrip, goBack, currentUser, hasPermission, isAdmin, onLogout }) {
  const storageKey = mode === "basic" ? "basic" : activeTrip?.id;
  const userId = currentUser?.id || null;

  const {
    transactions, currentTransactions, selected, setSelected,
    isAdding, setIsAdding, totals, loading, loadingMore,
    currentPage, totalPages, isOffline, pendingSyncCount,
    addTransaction, updateTransaction, deleteTransaction,
    loadMore, loadFromServer,
  } = useInfiniteTransactions(storageKey, userId);

  const [visitCount, setVisitCount]                   = useState(1);
  const [lastActive, setLastActive]                   = useState("Just now");
  const [privacyMode, setPrivacyMode]                 = useState(false);
  const [isViewingOverview, setIsViewingOverview]     = useState(false);
  const [isViewingStats, setIsViewingStats]           = useState(false);
  const [isViewingCategories, setIsViewingCategories] = useState(false);
  const [isViewingGenerator, setIsViewingGenerator]   = useState(false);
  const [isViewingAdmin, setIsViewingAdmin]           = useState(false);
  const [isViewingSessions, setIsViewingSessions]     = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]             = useState(false);
  const [isChatOpen, setIsChatOpen]                   = useState(false);

  useEffect(() => {
    const savedVisits  = parseInt(getCookie("visit_count") || "0");
    const savedLast    = getCookie("last_active") || "First time";
    const savedPrivacy = getCookie("privacy_preference") === "true";
    const newCount     = savedVisits + 1;
    setVisitCount(newCount);
    setLastActive(savedLast);
    setPrivacyMode(savedPrivacy);
    setCookie("visit_count", newCount, 7);
    setCookie("last_active", new Date().toLocaleString(), 7);
  }, []);

  const togglePrivacy = () => {
    const next = !privacyMode;
    setPrivacyMode(next);
    setCookie("privacy_preference", next, 7);
  };

  const close = () => setIsSidebarOpen(false);

  const resetViews = () => {
    setIsViewingOverview(false); setIsViewingStats(false);
    setIsViewingCategories(false); setIsViewingGenerator(false);
    setIsViewingAdmin(false); setIsViewingSessions(false);
    setIsAdding(false); setSelected(null);
  };

  const goToDashboard  = () => { resetViews(); close(); };
  const goToOverview   = () => { resetViews(); setIsViewingOverview(true); close(); };
  const goToAddTx      = () => { resetViews(); setIsAdding(true); close(); };
  const goToStatistics = () => { resetViews(); setIsViewingStats(true); close(); };
  const goToCategories = () => { resetViews(); setIsViewingCategories(true); close(); };
  const goToGenerator  = () => { resetViews(); setIsViewingGenerator(true); close(); };
  const goToAdmin      = () => { resetViews(); setIsViewingAdmin(true); close(); };
  const goToSessions   = () => { resetViews(); setIsViewingSessions(true); close(); };
  const handleLogout   = () => { onLogout?.(); };

  const handleNewTransactions = useCallback(() => {
    if (loadFromServer) loadFromServer();
  }, [loadFromServer]);

  const tripId = storageKey === "basic" ? null : storageKey;
  const pageTitle = mode === "basic" ? "Welcome back! 👋" : `${activeTrip?.name} ✈️`;
  const isDashboardView = !isAdding && !selected && !isViewingStats && !isViewingCategories && !isViewingOverview && !isViewingGenerator && !isViewingAdmin && !isViewingSessions;

  const navBtn = (active, onClick, icon, label) => (
    <button onClick={onClick}
      className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
        active ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}>
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#2563eb] text-slate-900 md:flex">

      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2">
          <span>⚠️ You are offline — changes are saved locally</span>
          {pendingSyncCount > 0 && (
            <span className="bg-white text-amber-600 rounded-full px-2 py-0.5 text-xs font-bold">
              {pendingSyncCount} pending sync
            </span>
          )}
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform bg-[#151b2b] shadow-2xl transition-transform duration-300 md:static md:z-10 md:w-64 md:max-w-none md:translate-x-0 md:shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/40">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">SmartSpend</h2>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                {currentUser?.name} · {currentUser?.role?.name}
              </p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-3 px-4 pb-4">
          {navBtn(isDashboardView,     goToDashboard,  <LayoutDashboard className="h-5 w-5" />, "Dashboard")}
          {navBtn(isViewingOverview,   goToOverview,   <Layout className="h-5 w-5" />,          "Overview")}
          {navBtn(isViewingStats,      goToStatistics, <BarChart3 className="h-5 w-5" />,       "Statistics")}
          {navBtn(isViewingCategories, goToCategories, <Tag className="h-5 w-5" />,              "Categories")}
          {hasPermission('transaction:create') && navBtn(isAdding, goToAddTx, <Plus className="h-5 w-5" />, "Add Transaction")}
          {navBtn(isChatOpen, () => { setIsChatOpen(true); close(); }, <MessageCircle className="h-5 w-5" />, "Chat")}
          {navBtn(isViewingSessions, goToSessions, <Key className="h-5 w-5" />, "Sessions & Tokens")}
          {isAdmin && navBtn(isViewingGenerator, goToGenerator, <Zap className="h-5 w-5" />,    "Generator")}
          {isAdmin && navBtn(isViewingAdmin,     goToAdmin,     <Shield className="h-5 w-5" />, "Admin Panel")}
        </nav>

        <div className="border-t border-slate-700 p-4 space-y-2">
          <button onClick={goBack} className="w-full rounded-xl px-4 py-3 text-left font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <button onClick={handleLogout} className="w-full rounded-xl px-4 py-3 text-left font-medium text-slate-400 hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center gap-3">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <main className={`flex-1 overflow-y-auto ${isOffline ? "pt-10" : ""}`}>
        <div className="p-4 sm:p-6 lg:p-10">

          <div className="mb-6 flex items-center justify-between md:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl bg-white/10 p-3 text-white">
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-white">SmartSpend</h2>
            <button onClick={() => setIsChatOpen(true)} className="rounded-xl bg-white/10 p-3 text-white">
              <MessageCircle className="h-6 w-6" />
            </button>
          </div>

          {isAdding && <AddExpense onAdd={addTransaction} goBack={() => setIsAdding(false)} />}

          {selected && (
            <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <button onClick={() => setSelected(null)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <ExpenseDetail
                expense={selected}
                onDelete={hasPermission('transaction:delete') ? deleteTransaction : null}
                onUpdate={hasPermission('transaction:update') ? updateTransaction : null}
              />
            </div>
          )}

          {isViewingStats      && <Statistics storageKey={storageKey} userId={userId} />}
          {isViewingCategories && <Categories transactions={transactions} storageKey={storageKey} />}
          {isViewingOverview   && <Overview transactions={transactions} currentTransactions={currentTransactions} setSelected={setSelected} />}
          {isViewingGenerator  && isAdmin && <GeneratorPanel onNewTransactions={handleNewTransactions} tripId={tripId} userId={userId} />}
          {isViewingAdmin      && isAdmin && <AdminPanel />}
          {isViewingSessions && <SessionPanel currentUser={currentUser} isAdmin={isAdmin} />}

          {isDashboardView && (
            <div>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:mb-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
                  <h1 className="break-words text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{pageTitle}</h1>
                  <p className="mt-2 text-base text-blue-100 sm:text-lg">Here's what's happening with your money</p>
                  <p className="mt-2 break-words text-xs font-medium text-blue-200/70 sm:text-sm">
                    Visits: {visitCount} | Last active: {lastActive}
                  </p>
                </motion.div>
                <div className="hidden gap-3 md:flex">
                  <button onClick={togglePrivacy} className="rounded-xl bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20">
                    {privacyMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mb-10 md:gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-xl hover:shadow-2xl sm:p-6 lg:p-8">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Total Income</p>
                      <p className="break-words text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                        <span>{privacyMode ? "***" : totals.income.toFixed(0)}</span>
                        <span className="text-xl font-medium text-gray-400 sm:text-2xl"> lei</span>
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg sm:h-16 sm:w-16">
                      <TrendingUp className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-xl hover:shadow-2xl sm:p-6 lg:p-8">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">Total Expense</p>
                      <p className="break-words text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                        <span>{privacyMode ? "***" : totals.expense.toFixed(0)}</span>
                        <span className="text-xl font-medium text-gray-400 sm:text-2xl"> lei</span>
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 shadow-lg sm:h-16 sm:w-16">
                      <TrendingDown className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-3xl bg-white p-5 shadow-xl sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Recent Transactions</h2>
                  {totalPages > 1 && (
                    <span className="text-xs text-gray-400 font-medium">
                      {transactions.length} loaded · page {currentPage}/{totalPages}
                    </span>
                  )}
                </div>
                <InfiniteTransactionList
                  transactions={transactions}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  loading={loading}
                  loadingMore={loadingMore}
                  privacyMode={privacyMode}
                  onSelect={setSelected}
                  loadMore={loadMore}
                />
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isChatOpen && (
          <ChatPanel currentUser={currentUser} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;