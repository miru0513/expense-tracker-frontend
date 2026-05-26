import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { useInfiniteTransactions } from '../hooks/useInfiniteTransactions';

const COLORS = {
  Food: '#fb923c',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Entertainment: '#a855f7',
  Bills: '#ef4444',
  Health: '#22c55e',
  Other: '#6b7280',
};

export default function Statistics({ storageKey = 'basic', userId = null }) {
  const { transactions } = useInfiniteTransactions(storageKey, userId);

  const expenses = transactions.filter(t => t.type && t.type.toLowerCase() === 'expense');

  const categoryData = Object.keys(COLORS).map(category => {
    const total = expenses
      .filter(e => e.category && e.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: category, value: total };
  }).filter(item => item.value > 0);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const dailyData = eachDayOfInterval({ start: monthStart, end: monthEnd })
    .map(day => {
      const total = expenses
        .filter(e => {
          try {
            return isSameDay(new Date(e.date), day);
          } catch {
            return false;
          }
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return { date: format(day, 'MMM d'), amount: total };
    });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgDaily = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-4xl text-white mb-2 font-bold flex items-center gap-3">
          Statistics 📊
        </h1>
        <p className="text-blue-100 text-[15px]">Analyze your spending patterns for {format(now, 'MMMM yyyy')}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-8 shadow-xl">
          <div className="w-14 h-14 bg-[#a855f7] rounded-2xl flex items-center justify-center shadow-md mb-6">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <p className="text-[13px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Total Expenses</p>
          <p className="text-4xl text-gray-900 font-bold tracking-tight">
            {totalExpenses.toFixed(2)} <span className="text-xl text-gray-400 font-medium">lei</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-8 shadow-xl">
          <div className="w-14 h-14 bg-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-md mb-6">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <p className="text-[13px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Avg Per Expense</p>
          <p className="text-4xl text-gray-900 font-bold tracking-tight">
            {avgDaily.toFixed(2)} <span className="text-xl text-gray-400 font-medium">lei</span>
          </p>
        </motion.div>
      </div>

      {expenses.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-16 text-center shadow-xl">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-12 h-12 text-blue-300" />
          </div>
          <p className="text-gray-500 text-xl font-bold mb-2">No expenses yet</p>
          <p className="text-gray-400">Go to Add Transaction to add an expense and see your statistics!</p>
        </motion.div>
      ) : (
        <>
          {categoryData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2rem] p-8 mb-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                  <PieChartIcon className="w-5 h-5 text-pink-500" />
                </div>
                <h2 className="text-[22px] text-gray-900 font-semibold tracking-tight">Spending by Category</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      outerRadius={110}
                      innerRadius={0}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#fff"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name] || COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(2)} lei`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4 px-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[item.name] || COLORS.Other }} />
                        <span className="text-gray-900 font-medium text-[15px]">{item.name}</span>
                      </div>
                      <span className="text-gray-900 font-bold text-[15px]">
                        {item.value.toFixed(2)} <span className="text-gray-400 text-xs">lei</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2rem] p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-[22px] text-gray-900 font-semibold tracking-tight">Daily Spending (This Month)</h2>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  dy={10}
                  minTickGap={15}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  formatter={(value) => `${value.toFixed(2)} lei`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}