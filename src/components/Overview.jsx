import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, LayoutDashboard } from 'lucide-react';

const COLORS = {
  Food: '#fb923c', Transport: '#3b82f6', Shopping: '#ec4899',
  Entertainment: '#a855f7', Bills: '#ef4444', Health: '#22c55e', Other: '#6b7280',
};

export default function Overview({ transactions, currentTransactions, categoryBadges, setSelected }) {
  // Calculate category data for the mini-chart
  const expenses = transactions.filter(t => t.type && t.type.toLowerCase() === 'expense');
  const categoryData = Object.keys(COLORS).map(category => {
    const total = expenses
      .filter(e => e.category && e.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { name: category, value: total };
  }).filter(item => item.value > 0);

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <h1 className="text-4xl text-white font-bold mb-2">System Overview 🖥️</h1>
        <p className="text-blue-100 text-lg">Your financial snapshot at a glance</p>
      </motion.div>

      {/* Main Grid: Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Recent Transactions (From Dashboard) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-8 shadow-xl overflow-hidden">
          <h2 className="text-2xl text-gray-900 font-bold mb-6">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-2">Title</th>
                  <th className="py-3 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t)} className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group">
                    <td className="py-4 px-2 text-sm text-gray-700 font-semibold">{t.title}</td>
                    <td className={`py-4 px-2 font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* RIGHT: Spending Chart (From Statistics) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-8 shadow-xl flex flex-col items-center">
          <h2 className="text-2xl text-gray-900 font-bold mb-6 w-full text-left">Spending Share</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || COLORS.Other} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} lei`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            {categoryData.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                <span className="text-xs text-gray-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}