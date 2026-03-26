import { motion } from 'framer-motion';
import { Wallet, Plane } from 'lucide-react';

export default function ExpenseTypeSelection({ onSelectBasic, onSelectTrip }) {
  return (
    <div className="min-h-screen bg-[#2563eb] flex items-center justify-center p-6 text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-10 shadow-2xl max-w-lg w-full text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Expense Type</h1>
        <p className="text-gray-500 mb-8">What would you like to track?</p>
        
        <div className="space-y-4">
          <button 
            onClick={onSelectBasic}
            className="w-full flex items-center p-6 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group text-left"
          >
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mr-4">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Basic Expense</h3>
              <p className="text-sm text-gray-500">Track daily expenses</p>
            </div>
          </button>

          <button 
            onClick={onSelectTrip}
            className="w-full flex items-center p-6 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group text-left"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mr-4">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Trip Expense</h3>
              <p className="text-sm text-gray-500">Track trip-related expenses</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}