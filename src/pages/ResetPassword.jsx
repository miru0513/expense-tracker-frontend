import { useState } from "react";
import { Lock, CheckCircle, XCircle } from "lucide-react";

const _viaProxy   = !import.meta.env.VITE_API_HOST && window.location.hostname === 'localhost';
const BASE_HOST   = import.meta.env.VITE_API_HOST
  || (_viaProxy ? `localhost:${window.location.port || 5173}` : '10.166.91.149:3001');
const GRAPHQL_URL = `${_viaProxy ? 'http' : 'https'}://${BASE_HOST}/graphql`;

export default function ResetPassword({ token, goToLogin }) {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 4)  { setError("Password must be at least 4 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation($token:String!,$pwd:String!){ resetPassword(token:$token,newPassword:$pwd){ success message } }`,
          variables: { token, pwd: password },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      const result = json.data.resetPassword;
      if (!result.success) throw new Error(result.message);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {success ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password updated!</h2>
            <p className="text-gray-500 text-sm mb-6">You can now log in with your new password.</p>
            <button onClick={goToLogin} className="w-full py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all">
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Set new password</h2>
            <p className="text-gray-500 text-sm mb-6">Choose a new password for your account.</p>

            {error && (
              <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-all">
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
