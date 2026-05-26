import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Presentation from "./pages/Presentation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InfoPage from "./pages/InfoPage";
import ExpenseTypeSelection from "./pages/ExpenseTypeSelection";
import TripList from "./pages/TripList";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { fetchTrips, createTrip, setAuthToken, logoutUser } from "./utils/api";
import { useInactivityLogout } from "./hooks/useInactivityLogout";

function App() {
  const [page, setPage] = useState("presentation");
  const [mode, setMode] = useState('basic');
  const [activeTrip, setActiveTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  // Handle OAuth callback (?oauth_token=...) and password reset (?reset_token=...) from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('oauth_token');
    const oauthUser  = params.get('oauth_user');
    const rt         = params.get('reset_token');

    if (oauthToken && oauthUser) {
      try {
        const user = JSON.parse(decodeURIComponent(oauthUser));
        setAuthToken(oauthToken);
        setCurrentUser(user);
        setPage('info');
      } catch {}
      window.history.replaceState({}, '', window.location.pathname);
    } else if (rt) {
      setResetToken(rt);
      setPage('resetPassword');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const isAdmin = currentUser?.role?.name === 'admin';
  const userPermissions = currentUser?.role?.permissions?.map(p => p.name) || [];
  const hasPermission = (perm) => isAdmin || userPermissions.includes(perm);

  const handleLogout = async () => {
    await logoutUser(); // revokes session on backend, then clears local token
    setCurrentUser(null);
    setPage("presentation");
  };

  // Inactivity session timeout — only active while a user is logged in
  const { secondsLeft } = useInactivityLogout(handleLogout, !!currentUser);

  useEffect(() => {
    if (currentUser) {
      fetchTrips(currentUser.id)
        .then((res) => setTrips(res.data))
        .catch(console.error);
    }
  }, [currentUser]);

  const handleAddTrip = async (tripName, icon = '✈️') => {
    if (!hasPermission('trip:create')) return;
    try {
      const newTrip = await createTrip({ name: tripName, icon });
      setTrips((prev) => [...prev, newTrip]);
    } catch (err) {
      console.error('Failed to create trip:', err);
    }
  };

  const handleLogin = (user, token) => {
    setAuthToken(token);
    setCurrentUser(user);
    setPage("info");
  };

  const handleRegister = (user, token) => {
    setAuthToken(token);
    setCurrentUser(user);
    setPage("info");
  };

  return (
    <>
      {/* Inactivity warning banner — only shown in the last 60 s before auto-logout */}
      {secondsLeft !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#7c3aed', color: '#fff',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '14px', fontWeight: 500,
        }}>
          <span>
            You will be logged out due to inactivity in{' '}
            <strong>{secondsLeft}s</strong>.
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Log out now
          </button>
        </div>
      )}

      {page === "presentation"  && <Presentation goToLogin={() => setPage("login")} goToRegister={() => setPage("register")} />}
      {page === "login"         && <Login onLogin={handleLogin} goToRegister={() => setPage("register")} goBack={() => setPage("presentation")} goToForgotPassword={() => setPage("forgotPassword")} />}
      {page === "register"      && <Register onRegister={handleRegister} goToLogin={() => setPage("login")} goBack={() => setPage("presentation")} />}
      {page === "forgotPassword" && <ForgotPassword goBack={() => setPage("login")} />}
      {page === "resetPassword"  && <ResetPassword token={resetToken} goToLogin={() => setPage("login")} />}
      {page === "info"         && <InfoPage onContinue={() => setPage("selection")} />}
      {page === "selection"    && <ExpenseTypeSelection onSelectBasic={() => { setMode('basic'); setActiveTrip(null); setPage("home"); }} onSelectTrip={() => { setMode('trip'); setPage("triplist"); }} />}
      {page === "triplist"     && <TripList trips={trips} onAddTrip={handleAddTrip} onSelectTrip={(trip) => { setMode('trip'); setActiveTrip(trip); setPage("home"); }} />}
      {page === "home"         && (
        <Home
          mode={mode}
          activeTrip={activeTrip}
          currentUser={currentUser}
          hasPermission={hasPermission}
          isAdmin={isAdmin}
          goBack={() => setPage(mode === 'basic' ? 'selection' : 'triplist')}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
