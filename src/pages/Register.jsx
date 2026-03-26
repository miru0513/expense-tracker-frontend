import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

function Register({ onRegister, goBack }) {
  const handleRegister = (e) => {
    e.preventDefault();
    if (onRegister) onRegister(); // Sends user back to Login
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6 flex flex-col justify-center text-slate-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto w-full">
        <button onClick={goBack} className="mb-8 p-2 hover:bg-violet-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-violet-100">
          <h1 className="text-3xl font-semibold mb-2 text-center">Create Account</h1>
          <p className="text-gray-600 mb-8 text-center">Join SmartSpend today</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" required />
            </div>
            <button type="submit" className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition-all shadow-lg">
              Create Account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;