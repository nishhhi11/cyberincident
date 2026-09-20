function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <h1>CyberIncident Dashboard</h1>

      <p>Welcome, {user?.name}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}

export default Dashboard;
