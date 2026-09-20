import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportIncident from "./pages/ReportIncident";
import Tickets from "./pages/Tickets";
import Profile from "./pages/Profile";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [page, setPage] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setPage("dashboard");
  };

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  return (
    <div className={darkMode ? "app dark-mode" : "app light-mode"}>
      <aside className="sidebar">

        <div className="sidebar-brand">

          <div>
            <h2>CyberIncident</h2>
            <span>SECURITY PLATFORM</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p>MAIN</p>

          <button
            className={
              page === "dashboard"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => setPage("dashboard")}
          >
            <span>◉</span>
            Dashboard
          </button>

          <button
            className={
              page === "tickets"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => setPage("tickets")}
          >
            <span>▣</span>
            Tickets
          </button>

          <button
            className={
              page === "report"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => setPage("report")}
          >
            <span>＋</span>
            Report Incident
          </button>
        </div>

        <div className="sidebar-section">
          <p>ACCOUNT</p>

          <button
            className={
              page === "profile"
                ? "sidebar-link active"
                : "sidebar-link"
            }
            onClick={() => setPage("profile")}
          >
            <span>◎</span>
            Profile
          </button>
        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="top-header">

          <div>
            <span className="system-status">
              <span></span>
              SYSTEM OPERATIONAL
            </span>
          </div>

          <div className="header-actions">

            <button
              className="theme-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              className="profile-button"
              onClick={() => setPage("profile")}
            >
              <div className="header-avatar">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div>
                <strong>{user?.name}</strong>
                <span>{user?.role}</span>
              </div>
            </button>

          </div>

        </header>

        <div className="page-content">

          {page === "dashboard" && (
            <Dashboard />
          )}

          {page === "tickets" && (
            <Tickets />
          )}

          {page === "report" && (
            <ReportIncident />
          )}

          {page === "profile" && (
            <Profile />
          )}

        </div>

      </main>
    </div>
  );
}

export default App;