import React from 'react';
import { motion } from 'framer-motion'; // Changed to 'framer-motion' to match your Login setup
import { Wallet, TrendingUp, PieChart, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Track Expenses',
    description: 'Monitor your spending habits and stay on top of your finances',
    color: 'from-blue-400 to-blue-500',
  },
  {
    icon: PieChart,
    title: 'Visual Analytics',
    description: 'Beautiful charts and graphs to understand your spending patterns',
    color: 'from-purple-400 to-purple-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Data is stored in volatile RAM for maximum privacy',
    color: 'from-green-400 to-green-500',
  },
  {
    icon: Zap,
    title: 'Quick & Easy',
    description: 'Add transactions in seconds with our intuitive interface',
    color: 'from-orange-400 to-orange-500',
  },
];

const benefits = [
  'Real-time expense tracking',
  'Category-based organization',
  'Volatile RAM storage (Task 0)',
  'Detailed statistics and reports',
  'Budget insights',
  '90%+ Test Coverage verified',
];

// We use the onContinue prop passed from App.jsx instead of useNavigate
const InfoPage = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 flex items-center justify-center overflow-y-auto">
      <div className="max-w-6xl w-full py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl mb-6 shadow-2xl shadow-pink-500/50"
          >
            <Wallet className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-6xl text-white mb-4 font-bold">Welcome to SmartSpend</h1>
          <p className="text-2xl text-blue-100 max-w-3xl mx-auto">
            Your intelligent companion for managing expenses and achieving financial clarity
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-white mb-3 font-semibold">{feature.title}</h3>
                <p className="text-blue-100">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-12"
        >
          <h3 className="text-2xl text-white mb-6 font-semibold text-center">System Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <button
            onClick={onContinue} // Renamed from navigate() to onContinue()
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl text-xl font-semibold hover:scale-105"
          >
            Go to Dashboard
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-blue-100 mt-6 text-sm">
            Access your volatile storage tables and take control of your finances
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoPage;