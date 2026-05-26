import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, AlertCircle, ShieldQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import { registerUser } from '../utils/api';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What was the make of your first car?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?",
];

function Register({ onRegister, goToLogin, goBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!securityQuestion) { setError('Please select a security question.'); return; }
    if (securityAnswer.trim().length < 2) { setError('Security answer must be at least 2 characters.'); return; }
    setLoading(true);
    try {
      const result = await registerUser(name, email, password, securityQuestion, securityAnswer);
      if (result.success) {
        onRegister(result.user, result.token);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto">
        <button onClick={goBack} className="mb-8 p-2 hover:bg-violet-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <h1 className="text-3xl font-semibold mb-2 text-gray-900">Create Account</h1>
          <p className="text-gray-600 mb-8">Sign up to start tracking your expenses</p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 4 chars)"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                  required />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldQuestion className="w-5 h-5 text-violet-600" />
                <p className="text-sm font-medium text-gray-700">Security Question</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">Used as the 3rd step when you log in</p>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Choose a question</label>
                <select
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-gray-700"
                >
                  <option value="">Select a security question...</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Your answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Your answer (case-insensitive)"
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-violet-600 text-white font-medium py-4 rounded-2xl hover:bg-violet-700 transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <button onClick={goToLogin} className="text-violet-600 font-medium hover:text-violet-700">
              Login
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;
