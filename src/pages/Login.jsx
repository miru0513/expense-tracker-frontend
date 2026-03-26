import { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion'; 

function Login({ onLogin, goToRegister, goBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Triggers the navigate('infopage') function from App.jsx
    if (onLogin) onLogin(); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6 flex flex-col justify-center text-slate-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto w-full">
        {/* Back Arrow */}
        <button onClick={goBack} className="mb-8 p-2 hover:bg-violet-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-8 rounded-3xl shadow-xl border border-violet-100">
          <h1 className="text-3xl font-semibold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-600 mb-8 text-center">Login to your account</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-600 outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition-all shadow-lg">
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            New user?{' '}
            <button onClick={goToRegister} className="text-violet-600 font-medium hover:underline">
              Register now
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;