import { useState } from "react";
import Home from "./pages/Home";
import Presentation from "./pages/Presentation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InfoPage from "./pages/InfoPage";
import ExpenseTypeSelection from "./pages/ExpenseTypeSelection"; 
import TripList from "./pages/TripList";

function App() {
  const [page, setPage] = useState("presentation");
  const [mode, setMode] = useState('basic'); 
  const [activeTrip, setActiveTrip] = useState(null);
  const [trips, setTrips] = useState([]);

  const handleAddTrip = (tripName, icon = '✈️') => {
  const newTrip = {
    id: Date.now().toString(),
    name: tripName,
    icon,
    date: new Date().toLocaleDateString(),
  };
  setTrips((prev) => [...prev, newTrip]);
};
  if (page === "presentation") {
    return (
      <Presentation
        goToLogin={() => setPage("login")}
        goToRegister={() => setPage("register")}
      />
    );
  }

  if (page === "login") {
    return (
      <Login
        onLogin={() => setPage("info")} 
        goToRegister={() => setPage("register")}
        goBack={() => setPage("presentation")}
      />
    );
  }

  if (page === "register") {
    return (
      <Register
        onRegister={() => setPage("info")} 
        goToLogin={() => setPage("login")}
        goBack={() => setPage("presentation")}
      />
    );
  }

  if (page === "info") {
    return (
      <InfoPage 
        onContinue={() => setPage("selection")} 
      />
    );
  }

  if (page === "selection") {
    return (
      <ExpenseTypeSelection 
        onSelectBasic={() => { 
          setMode('basic'); 
          setActiveTrip(null); 
          setPage("home"); 
        }}
        onSelectTrip={() => { 
          setMode('trip'); 
          setPage("triplist"); 
        }}
      />
    );
  }

  if (page === "triplist") {
    return (
      <TripList
        trips={trips}
        onAddTrip={handleAddTrip}
        onSelectTrip={(trip) => { 
          setMode('trip'); 
          setActiveTrip(trip); 
          setPage("home"); 
        }}
      />
    );
  }

  return (
    <Home 
      mode={mode} 
      activeTrip={activeTrip} 
      goBack={() => setPage(mode === 'basic' ? 'selection' : 'triplist')} 
    />
  );
}

export default App;