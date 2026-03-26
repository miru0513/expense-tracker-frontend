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
  Layout,
  Menu,
  X,
} from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import AddExpense from "../components/AddExpense";
import ExpenseDetail from "../components/ExpenseDetail";
import { setCookie, getCookie } from "../utils/cookies";
import Statistics from "../components/Statistics";
import Categories from "../components/Categories";
import Overview from "../components/Overview";

const categoryBadges = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Shopping: "bg-pink-100 text-pink-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Bills: "bg-red-100 text-red-700",
  Health: "bg-green-100 text-green-700",
  Other: "bg-gray-100 text-gray-700",
};

function Home({ mode, activeTrip, goBack }) {
  const storageKey = mode === "basic" ? "basic" : activeTrip?.id;

  const {
    currentTransactions,
    transactions,
    selected,
    setSelected,
    isAdding,
    setIsAdding,
    currentPage,
    setCurrentPage,
    totalPages,
    totals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(storageKey);

  const [visitCount, setVisitCount] = useState(1);
  const [lastActive, setLastActive] = useState("Just now");
  const [privacyMode, setPrivacyMode] = useState(false);

  const [isViewingOverview, setIsViewingOverview] = useState(false);
  const [isViewingStats, setIsViewingStats] = useState(false);
  const [isViewingCategories, setIsViewingCategories] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedVisits = parseInt(getCookie("visit_count") || "0");
    const savedLastActive = getCookie("last_active") || "First time";
    const savedPrivacy = getCookie("privacy_preference") === "true";

    const newVisitCount = savedVisits + 1;
    setVisitCount(newVisitCount);
    setLastActive(savedLastActive);
    setPrivacyMode(savedPrivacy);

    setCookie("visit_count", newVisitCount, 7);
    setCookie("last_active", new Date().toLocaleString(), 7);
  }, []);

  const togglePrivacy = () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    setCookie("privacy_preference", newMode, 7);
  };

  const closeSidebarOnMobile = () => {
    setIsSidebarOpen(false);
  };

  const goToDashboard = () => {
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
    setIsViewingStats(false);
    setIsViewingCategories(false);
    closeSidebarOnMobile();
  };

  const goToOverview = () => {
    setIsViewingOverview(true);
    setIsViewingStats(false);
    setIsViewingCategories(false);
    setIsAdding(false);
    setSelected(null);
    closeSidebarOnMobile();
  };

  const goToAddTransaction = () => {
    setIsAdding(true);
    setSelected(null);
    setIsViewingStats(false);
    setIsViewingCategories(false);
    setIsViewingOverview(false);
    closeSidebarOnMobile();
  };

  const goToStatistics = () => {
    setIsViewingStats(true);
    setIsViewingCategories(false);
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
    closeSidebarOnMobile();
  };

  const goToCategories = () => {
    setIsViewingCategories(true);
    setIsViewingStats(false);
    setIsViewingOverview(false);
    setIsAdding(false);
    setSelected(null);
    closeSidebarOnMobile();
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  const pageTitle =
    mode === "basic" ? "Welcome back! 👋" : `${activeTrip?.name} ✈️`;

  const isDashboardView =
    !isAdding &&
    !selected &&
    !isViewingStats &&
    !isViewingCategories &&
    !isViewingOverview;

  return (
    <div className="min-h-screen bg-[#2563eb] text-slate-900 md:flex">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] transform bg-[#151b2b] shadow-2xl transition-transform duration-300 md:static md:z-10 md:w-64 md:max-w-none md:translate-x-0 md:shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/40">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-white">
                SmartSpend
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Track your expenses
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-3 px-4 pb-4">
          <button
            onClick={goToDashboard}
            className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
              isDashboardView
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={goToAddTransaction}
            className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
              isAdding
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Add Transaction</span>
          </button>

          <button
            onClick={goToStatistics}
            className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
              isViewingStats
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Statistics</span>
          </button>

          <button
            onClick={goToCategories}
            className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
              isViewingCategories
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Tag className="h-5 w-5" />
            <span>Categories</span>
          </button>

          <button
            onClick={goToOverview}
            className={`w-full rounded-xl px-4 py-3.5 text-left font-medium transition-all flex items-center gap-3 ${
              isViewingOverview
                ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layout className="h-5 w-5" />
            <span>Overview</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-slate-800 p-4">
          <button
            onClick={() => {
              closeSidebarOnMobile();
              goBack?.();
            }}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Exit to Trips</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 font-medium text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#2563eb]/95 px-4 py-4 backdrop-blur md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl bg-white/10 p-3 text-white shadow-lg transition hover:bg-white/20"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="mx-3 min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {mode === "basic" ? "SmartSpend" : activeTrip?.name}
            </p>
            <p className="truncate text-xs text-blue-100/80">
              Track your expenses
            </p>
          </div>

          <button
            onClick={togglePrivacy}
            className="rounded-xl bg-white/10 p-3 text-white shadow-lg transition hover:bg-white/20"
            title="Toggle Privacy Mode"
            aria-label="Toggle privacy mode"
          >
            {privacyMode ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 md:p-10">
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
            <div className="flex min-h-[70vh] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-4 shadow-2xl sm:p-6"
              >
                <AddExpense onAdd={addTransaction} goBack={goToDashboard} />
              </motion.div>
            </div>
          ) : selected ? (
            <div className="flex min-h-[70vh] items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
              >
                <button
                  onClick={goToDashboard}
                  className="mb-6 flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-blue-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </button>

                <ExpenseDetail
                  expense={selected}
                  onDelete={deleteTransaction}
                  onUpdate={updateTransaction}
                />
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-6xl">
              <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-start md:justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="min-w-0"
                >
                  <h1 className="break-words text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    {pageTitle}
                  </h1>
                  <p className="mt-2 text-base text-blue-100 sm:text-lg">
                    Here's what's happening with your money
                  </p>
                  <p className="mt-2 break-words text-xs font-medium text-blue-200/70 sm:text-sm">
                    Visits: {visitCount} | Last active: {lastActive}
                  </p>
                </motion.div>

                <div className="hidden gap-3 md:flex">
                  <button
                    onClick={togglePrivacy}
                    className="rounded-xl bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
                    title="Toggle Privacy Mode"
                    aria-label="Toggle privacy mode"
                  >
                    {privacyMode ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mb-10 md:gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-6 lg:p-8"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">
                        Total Income
                      </p>
                      <p className="break-words text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                        {privacyMode ? "***" : `${totals.income.toFixed(0)}`}{" "}
                        <span className="text-xl font-medium text-gray-400 sm:text-2xl">
                          lei
                        </span>
                      </p>
                    </div>

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 sm:h-16 sm:w-16">
                      <TrendingUp className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-xl transition-all duration-300 hover:shadow-2xl sm:p-6 lg:p-8"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 sm:text-sm">
                        Total Expense
                      </p>
                      <p className="break-words text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                        {privacyMode ? "***" : `${totals.expense.toFixed(0)}`}{" "}
                        <span className="text-xl font-medium text-gray-400 sm:text-2xl">
                          lei
                        </span>
                      </p>
                    </div>

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/30 sm:h-16 sm:w-16">
                      <TrendingDown className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl bg-white p-5 shadow-xl sm:p-6 lg:p-8"
              >
                <div className="mb-6 flex items-center justify-between sm:mb-8">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Recent Transactions
                  </h2>
                </div>

                {transactions.length === 0 ? (
                  <div className="py-12 text-center sm:py-16">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                      <BarChart3 className="h-10 w-10 text-blue-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-500">
                      No transactions yet
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Use the menu to add one.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-2xl">
                      <table className="min-w-[640px] w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <th className="px-4 py-4 text-left">Title</th>
                            <th className="px-4 py-4 text-left">Category</th>
                            <th className="px-4 py-4 text-left">Amount</th>
                            <th className="px-4 py-4 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTransactions.map((t, index) => (
                            <motion.tr
                              key={t.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => setSelected(t)}
                              className="group cursor-pointer border-b border-gray-50 transition-colors hover:bg-blue-50"
                            >
                              <td className="px-4 py-5 text-sm font-semibold text-gray-700 sm:py-6">
                                {t.title}
                              </td>
                              <td className="px-4 py-5 sm:py-6">
                                <span
                                  className={`inline-block rounded-md px-3 py-1.5 text-xs font-bold tracking-wide ${
                                    categoryBadges[t.category] ||
                                    categoryBadges.Other
                                  }`}
                                >
                                  {t.category}
                                </span>
                              </td>
                              <td
                                className={`px-4 py-5 text-sm font-bold sm:py-6 sm:text-base ${
                                  t.type === "income"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {privacyMode
                                  ? "***"
                                  : `${t.type === "income" ? "+" : "-"}${t.amount.toFixed(0)} lei`}
                              </td>
                              <td className="px-4 py-5 text-sm font-medium text-gray-400 sm:py-6">
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-gray-400">
                        Page {currentPage} of {totalPages}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 sm:px-5"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 sm:px-5"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;