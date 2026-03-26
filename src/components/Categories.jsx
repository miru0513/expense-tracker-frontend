import { motion } from 'framer-motion';

const categoryIcons = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎮',
  Bills: '📄',
  Health: '⚕️',
  Other: '📦',
};

const categoryColors = {
  Food: 'from-orange-400 to-orange-500',
  Transport: 'from-blue-400 to-blue-500',
  Shopping: 'from-pink-400 to-pink-500',
  Entertainment: 'from-purple-400 to-purple-500',
  Bills: 'from-red-400 to-red-500',
  Health: 'from-green-400 to-green-500',
  Other: 'from-gray-400 to-gray-500',
};

export default function Categories({ transactions }) {
  // Only calculate expenses for the category breakdown
  const expenses = transactions.filter(t => t.type && t.type.toLowerCase() === 'expense');

  const categories = Object.keys(categoryIcons).map(category => {
    const categoryExpenses = expenses.filter(e => e.category && e.category.toLowerCase() === category.toLowerCase());
    const total = categoryExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const count = categoryExpenses.length;

    return {
      name: category,
      icon: categoryIcons[category],
      color: categoryColors[category] || categoryColors.Other,
      total,
      count,
    };
  });

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl text-white mb-2 font-bold">Categories 🏷️</h1>
        <p className="text-blue-100 text-[15px]">Browse your expense categories</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
          >
            <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-md`}>
              {category.icon}
            </div>
            <h3 className="text-2xl text-gray-900 mb-1 font-bold tracking-tight">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">{category.count} {category.count === 1 ? 'transaction' : 'transactions'}</p>
            
            {/* Formatted perfectly with 'lei' instead of '$' */}
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-4xl text-gray-900 font-bold">{category.total.toFixed(0)}</span>
              <span className="text-sm text-gray-500 font-semibold">.{category.total.toFixed(2).split('.')[1]} lei</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}