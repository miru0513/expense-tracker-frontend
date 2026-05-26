import { useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle, KeyRound, ShieldQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, verifyLoginCode, verifySecurityQuestion } from '../utils/api';

const _viaProxy  = !import.meta.env.VITE_API_HOST && window.location.hostname === 'localhost';
const BASE_HOST  = import.meta.env.VITE_API_HOST
  || (_viaProxy ? `localhost:${window.location.port || 5173}` : '10.166.91.149:3001');
const OAUTH_BASE = `${_viaProxy ? 'http' : 'https'}://${BASE_HOST}/auth`;

const STEP_LABELS = ['Credentials', 'Email Code', 'Security Question'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
            i < current ? 'bg-violet-600 text-white' :
            i === current ? 'bg-violet-600 text-white ring-4 ring-violet-200' :
            'bg-gray-200 text-gray-500'
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-violet-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Login({ onLogin, goToRegister, goBack, goToForgotPassword }) {
  const [step, setStep] = useState(0); // 0=credentials, 1=otp, 2=security
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        setPendingToken(result.pendingToken);
        setStep(1);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verifyLoginCode(pendingToken, code);
      if (result.success) {
        if (result.token) {
          // No security question set — login complete
          onLogin(result.user, result.token);
        } else {
          setPendingToken(result.pendingToken);
          setSecurityQuestion(result.securityQuestion);
          setStep(2);
        }
      } else {
        setError(result.message);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await verifySecurityQuestion(pendingToken, answer);
      if (result.success) {
        onLogin(result.user, result.token);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToStart = () => {
    setStep(0);
    setCode('');
    setAnswer('');
    setPendingToken('');
    setSecurityQuestion('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6 flex flex-col justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto w-full">
        <button onClick={step === 0 ? goBack : resetToStart} className="mb-8 p-2 hover:bg-violet-100 rounded-full transition-colors inline-block">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-violet-100">

          <h1 className="text-3xl font-semibold mb-2 text-gray-900 text-center">Welcome Back</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Secure 3-step login</p>

          <StepIndicator current={step} />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ── Step 1: Credentials ── */}
            {step === 0 && (
              <motion.form key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCredentials} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                      required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                      required />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">
                  {loading ? 'Checking...' : 'Continue'}
                </button>

                <div className="text-right">
                  <button type="button" onClick={goToForgotPassword} className="text-xs text-violet-500 hover:underline">
                    Forgot password?
                  </button>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a href={`${OAUTH_BASE}/google`}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </a>
                  <a href={`${OAUTH_BASE}/github`}
                    className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    GitHub
                  </a>
                </div>

                <p className="text-center text-gray-600 mt-4">
                  Don't have an account?{' '}
                  <button type="button" onClick={goToRegister} className="text-violet-600 font-medium hover:underline">
                    Register
                  </button>
                </p>
              </motion.form>
            )}

            {/* ── Step 2: Email OTP ── */}
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyCode} className="space-y-5">
                <div className="text-center p-4 bg-violet-50 rounded-2xl mb-4">
                  <KeyRound className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">A 6-digit code was sent to</p>
                  <p className="font-semibold text-gray-900">{email}</p>
                  <p className="text-xs text-gray-500 mt-1">It expires in 10 minutes</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-3xl tracking-[1rem] font-bold py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                    required
                  />
                </div>

                <button type="submit" disabled={loading || code.length !== 6}
                  className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Didn't get the code?{' '}
                  <button type="button" onClick={resetToStart} className="text-violet-600 hover:underline">
                    Start over
                  </button>
                </p>
              </motion.form>
            )}

            {/* ── Step 3: Security Question ── */}
            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyQuestion} className="space-y-5">
                <div className="text-center p-4 bg-violet-50 rounded-2xl mb-4">
                  <ShieldQuestion className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">Answer your security question to finish</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Security Question</label>
                  <p className="w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-2xl text-sm font-medium">
                    {securityQuestion}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">Your Answer</label>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Answer is case-insensitive</p>
                </div>

                <button type="submit" disabled={loading || !answer.trim()}
                  className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Complete Login'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
