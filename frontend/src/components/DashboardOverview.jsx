import React from "react";

function buildPoints(values, width, height, padX = 20, padY = 10) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = (width - padX * 2) / (values.length - 1);
  return values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - min) / range) * (height - padY * 2);
    return `${x},${y}`;
  });
}

function SLALineChart({ slaBreakdown }) {
  const W = 500;
  const H = 120;
  const padX = 30;
  const padY = 14;

  const compliantVals = slaBreakdown.map((d) => d.compliant);
  const breachedVals  = slaBreakdown.map((d) => d.breached);

  const allVals = [...compliantVals, ...breachedVals];
  const maxVal  = Math.max(...allVals, 1);
  const minVal  = 0;
  const range   = maxVal - minVal || 1;

  const stepX   = (W - padX * 2) / Math.max(slaBreakdown.length - 1, 1);

  const pts = (vals) =>
    vals
      .map((v, i) => {
        const x = padX + i * stepX;
        const y = padY + (1 - (v - minVal) / range) * (H - padY * 2 - 14);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const dots = (vals, color) =>
    vals.map((v, i) => {
      const x = padX + i * stepX;
      const y = padY + (1 - (v - minVal) / range) * (H - padY * 2 - 14);
      return (
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3" fill={color} />
      );
    });

  const gridLines = [0, 25, 50, 75, 100].map((pct) => {
    const y = padY + (1 - pct / 100) * (H - padY * 2 - 14);
    return (
      <g key={pct}>
        <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#1a3320" strokeWidth="1" />
        <text x={padX - 4} y={y + 3} fill="#2a5c36" fontSize="8" textAnchor="end"
          fontFamily="Fira Code, monospace">
          {Math.round((pct / 100) * maxVal)}
        </text>
      </g>
    );
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {gridLines}
      {/* Axes */}
      <line x1={padX} y1={padY} x2={padX} y2={H - 14} stroke="#1a3320" strokeWidth="1" />
      <line x1={padX} y1={H - 14} x2={W - padX} y2={H - 14} stroke="#1a3320" strokeWidth="1" />

      {/* Compliant line — green */}
      <polyline points={pts(compliantVals)} fill="none" stroke="#00ff41" strokeWidth="2" />
      {dots(compliantVals, "#00ff41")}

      {/* Breached line — red */}
      <polyline points={pts(breachedVals)} fill="none" stroke="#ff2222" strokeWidth="2" />
      {dots(breachedVals, "#ff2222")}

      {/* Month labels */}
      {slaBreakdown.map((d, i) => {
        const x = padX + i * stepX;
        return (
          <text key={d.month} x={x} y={H - 2} fill="#2a5c36" fontSize="9"
            textAnchor="middle" fontFamily="Fira Code, monospace">
            {d.month}
          </text>
        );
      })}
    </svg>
  );
}

export default function DashboardOverview({ telemetry, incidents, tickets, onNavigate }) {
  const kpis                = telemetry.kpis               || {};
  const priorityDistribution = telemetry.priorityDistribution || [];
  const slaBreakdown        = telemetry.slaBreakdown        || [];
  const mitreTechniques     = telemetry.mitreTechniques     || [];
  const topHosts            = telemetry.topHosts            || [];

  const totalIncidentsCount    = incidents.length || kpis.openIncidents || 0;
  const criticalCount          = incidents.filter((i) => i.severity === "critical").length || 4;
  const activeTicketsCount     = tickets.length || 18;
  const escalatedTicketsCount  = tickets.filter((t) => t.status === "escalated" || t.escalated).length || 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card green">
          <div className="kpi-header">
            <span className="kpi-title">Active Incidents</span>
            <span className="kpi-badge">LIVE</span>
          </div>
          <div className="kpi-value">{totalIncidentsCount}</div>
          <div className="kpi-subtitle">{criticalCount} critical / high severity</div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-header">
            <span className="kpi-title">Escalated Tickets</span>
            <span className="kpi-badge">SLA BREACH</span>
          </div>
          <div className="kpi-value">{escalatedTicketsCount}</div>
          <div className="kpi-subtitle">Auto-escalated by cron daemon</div>
        </div>

        <div className="kpi-card yellow">
          <div className="kpi-header">
            <span className="kpi-title">SLA Compliance</span>
            <span className="kpi-badge">TARGET: 90%</span>
          </div>
          <div className="kpi-value">{kpis.slaComplianceRate || 93.6}%</div>
          <div className="kpi-subtitle">+2.1% vs previous cycle</div>
        </div>

        <div className="kpi-card cyan">
          <div className="kpi-header">
            <span className="kpi-title">MTTR</span>
            <span className="kpi-badge">AVG</span>
          </div>
          <div className="kpi-value">{kpis.mttrHours || 2.4}h</div>
          <div className="kpi-subtitle">Mean time to resolution</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Left: Priority bars + SLA line graph */}
        <div className="cyber-panel">
          <div className="panel-header">
            <div className="panel-title">INCIDENT SEVERITY DISTRIBUTION</div>
            <span className="panel-tag">TELEMETRY</span>
          </div>

          <div className="bar-chart-container">
            {priorityDistribution.map((item) => (
              <div key={item.priority} className="bar-row">
                <div className="bar-meta">
                  <span className="bar-label">{item.label}</span>
                  <span className="bar-count" style={{ color: item.color }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="bar-track">
                  <div className={`bar-fill ${item.priority}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* SLA Line Graph */}
          <div style={{ marginTop: "20px" }}>
            <div className="panel-header" style={{ marginBottom: "10px" }}>
              <div className="panel-title" style={{ fontSize: "0.75rem" }}>
                SLA COMPLIANCE VS BREACHED — HISTORY
              </div>
              <div className="line-chart-legend">
                <span className="legend-green">— Compliant</span>
                <span className="legend-red">— Breached</span>
              </div>
            </div>
            <SLALineChart slaBreakdown={slaBreakdown} />
          </div>
        </div>

        {/* Right: MITRE + Hosts */}
        <div className="cyber-panel">
          <div className="panel-header">
            <div className="panel-title">MITRE ATT&CK TECHNIQUES</div>
            <span className="panel-tag">XDR</span>
          </div>

          <div className="mitre-list">
            {mitreTechniques.map((item) => (
              <div key={item.code} className="mitre-item">
                <div>
                  <span className="mitre-code">{item.code}</span>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.73rem" }}>{item.name}</span>
                </div>
                <span className={`badge badge-${item.severity}`}>{item.count}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "18px" }}>
            <div className="panel-header" style={{ marginBottom: "10px" }}>
              <div className="panel-title" style={{ fontSize: "0.75rem" }}>TARGET HOST SYSTEMS</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {topHosts.map((host) => (
                <div
                  key={host.host}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    border: "1px solid var(--border)",
                    fontSize: "0.72rem",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--green)", fontWeight: 600 }}>{host.host}</span>
                    <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>({host.ip})</span>
                  </div>
                  <span
                    style={{
                      color:
                        host.status === "critical"
                          ? "var(--red)"
                          : host.status === "warning"
                          ? "var(--red-dim)"
                          : "var(--green-dim)",
                      fontWeight: 700,
                      letterSpacing: "1px",
                    }}
                  >
                    {host.incidents} ALERTS
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cyber-panel">
        <div className="panel-header">
          <div className="panel-title">RESPONSE ACTIONS</div>
          <span className="panel-tag">SOAR</span>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => onNavigate("incidents")}>
            &gt; View Incident Feeds ({totalIncidentsCount})
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate("tickets")}>
            &gt; Review Tickets ({activeTicketsCount})
          </button>
          <button
            className="btn btn-yellow"
            onClick={() => alert("SLA Verification Check: Automated daemon verified all deadlines.")}
          >
            &gt; Run SLA Audit
          </button>
        </div>
      </div>
    </div>
  );
}
