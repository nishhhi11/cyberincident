import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  if (loggedIn) {
    return <Dashboard />;
  }

  return <Login onLogin={() => setLoggedIn(true)} />;
}

export default App;