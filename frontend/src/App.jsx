import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportIncident from "./pages/ReportIncident";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [page, setPage] = useState("dashboard");

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (page === "report") {
    return (
      <>
        <button
          className="back-button"
          onClick={() => setPage("dashboard")}
        >
          ← Back to Dashboard
        </button>

        <ReportIncident />
      </>
    );
  }

  return (
    <>
      <button
        className="report-button"
        onClick={() => setPage("report")}
      >
        + Report Incident
      </button>

      <Dashboard />
    </>
  );
}

export default App;