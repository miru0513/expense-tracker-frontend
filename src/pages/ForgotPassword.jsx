import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const _viaProxy   = !import.meta.env.VITE_API_HOST && window.location.hostname === 'localhost';
const BASE_HOST   = import.meta.env.VITE_API_HOST
  || (_viaProxy ? `localhost:${window.location.port || 5173}` : '10.166.91.149:3001');
const GRAPHQL_URL = `${_viaProxy ? 'http' : 'https'}://${BASE_HOST}/graphql`;

export default function ForgotPassword({ goBack }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation($email:String!){ forgotPassword(email:$email){ success message } }`,
          variables: { email },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </button>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm">
              If <strong>{email}</strong> is registered, a reset link has been sent.
              <br /><br />
              <span className="text-violet-600 font-medium">
                Running locally? The link is printed in the backend console.
              </span>
            </p>
            <button onClick={goBack} className="mt-6 w-full py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Forgot password?</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>

            {error && (
              <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-all">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
