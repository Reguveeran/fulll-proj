import React, { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api/api";
import Loader from "../components/Loader";
import { Link, useNavigate } from "react-router-dom"; 
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // ✅ State for Toast Notification
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // --- HELPER: SHOW TOAST ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- CHART CONFIGURATION ---
  const fleetActivityData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Active Vessels",
        data: [320, 340, 332, 350, 365, 383, 375], 
        borderColor: "#2e7d32", 
        backgroundColor: "rgba(46, 125, 50, 0.1)", 
        tension: 0.4, 
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#2e7d32",
        pointRadius: 4,
        pointHoverRadius: 6, // ✅ Expands on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index', // ✅ Shows tooltip when hovering anywhere on the x-axis line
      intersect: false,
    },
    plugins: {
      legend: { display: false }, 
      tooltip: { 
        backgroundColor: "#1f3c88",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 6,
        displayColors: false, // ✅ Clean text only
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f0f0f0" }, min: 200 }
    }
  };

  const cards = [
    { title: "Total Vessels", value: stats?.total_vessels || 0, icon: "🚢", color: "#1f3c88", trend: "+12%", trendColor: "#2e7d32", desc: "vs last week", link: "/search" },
    { title: "Active Voyages", value: stats?.active_voyages || 0, icon: "🌍", color: "#2e7d32", trend: "+5%", trendColor: "#2e7d32", desc: "efficiency rate", link: "/map" },
    { title: "Congestion Alerts", value: stats?.high_congestion_ports || 0, icon: "⚓", color: "#d32f2f", trend: "-2", trendColor: "#d32f2f", desc: "since yesterday", link: "/analyst" },
    { title: "Risk Zones", value: stats?.active_risks || 0, icon: "⚠️", color: "#f57c00", trend: "Stable", trendColor: "#f57c00", desc: "Weather & Piracy", link: "/map" },
  ];

  if (loading) return <Loader />;

  return (
    <main className="page" style={{ padding: "20px", background: "#f4f7fa", minHeight: "100vh", position: "relative" }}>
      
      {/* ✅ TOAST NOTIFICATION POPUP */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#333",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.9rem",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <span>✅</span> {toast}
        </div>
      )}

      {/* HEADER */}
      <header className="page__header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px"}}>
        <div>
            <h1 style={{margin: "0 0 5px 0", color: "#1f3c88", fontSize: "24px"}}>System Control Center</h1>
            <p style={{margin: 0, color: "#666", fontSize: "14px"}}>Real-time Maritime Operations & Congestion Analysis</p>
        </div>
        <div style={{textAlign: "right", display: "flex", alignItems: "center", gap: "15px"}}>
            <span style={{fontSize: "0.85rem", color: "#888"}}>🕒 Last Sync: Just now</span>
            <span style={{fontSize: "0.85rem", color: "#2e7d32", background: "#e8f5e9", padding: "6px 12px", borderRadius: "20px", fontWeight: "600", border: "1px solid #c8e6c9"}}>● System Operational</span>
        </div>
      </header>

      {/* KPI GRID */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "25px" }}>
        {cards.map((card) => (
          <div key={card.title} onClick={() => navigate(card.link)} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", borderLeft: `4px solid ${card.color}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-3px)"} onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", color: "#888" }}>{card.title}</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 5px 0", color: "#333" }}>{card.value}</p>
              <div style={{ fontSize: "0.85rem", fontWeight: "500", color: "#555" }}><span style={{ color: card.trendColor, fontWeight: "700" }}>{card.trend}</span> <span style={{ color: "#999", marginLeft: "4px", fontWeight: "400" }}>{card.desc}</span></div>
            </div>
            <div style={{ fontSize: "2rem", opacity: 0.2 }}>{card.icon}</div>
          </div>
        ))}
      </section>

      {/* SPLIT VIEW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "25px" }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* FLEET ACTIVITY CHART */}
            <section style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#333" }}>📈 Fleet Activity (Last 7 Days)</h3>
                <div style={{ height: "200px" }}>
                    <Line data={fleetActivityData} options={chartOptions} />
                </div>
            </section>

            {/* RECENT MOVEMENTS TABLE */}
            <section style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px" }}>
                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>Recent Movements</h3>
                    <Link to="/map" style={{ textDecoration: "none", color: "#1f3c88", fontSize: "0.85rem", fontWeight: "600" }}>View Full Log →</Link>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: "#888", borderBottom: "1px solid #eee" }}>
                            <th style={{ padding: "12px 12px 12px 0", fontWeight: "600" }}>Vessel</th>
                            <th style={{ padding: "12px", fontWeight: "600" }}>Origin → Dest.</th>
                            <th style={{ padding: "12px", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "12px 0 12px 12px", textAlign: "right", fontWeight: "600" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {stats?.recent_voyages?.map((voyage) => (
                          <tr key={voyage.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                            <td style={{ padding: "15px 12px 15px 0", fontWeight: "600", color: "#333" }}>{voyage.vessel_name}</td>
                            <td style={{ padding: "15px 12px", color: "#666" }}>{voyage.origin} <span style={{color: "#ccc"}}>➝</span> {voyage.destination}</td>
                            <td style={{ padding: "15px 12px" }}>
                                <span className={`status-chip ${voyage.status === "In Transit" ? "" : "docked"}`} 
                                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "600", background: voyage.status === "In Transit" ? "#e3f2fd" : "#fff3e0", color: voyage.status === "In Transit" ? "#1565c0" : "#e65100" }}>
                                  {voyage.status}
                                </span>
                            </td>
                            <td style={{ padding: "15px 0 15px 12px", textAlign: "right" }}>
                                <Link to="/map" 
                                      style={{ background: "white", border: "1px solid #1f3c88", color: "#1f3c88", padding: "6px 12px", borderRadius: "4px", textDecoration: "none", fontSize: "0.8rem", fontWeight: "600", transition: "all 0.2s" }}
                                      onMouseOver={(e) => { e.target.style.background = "#1f3c88"; e.target.style.color = "white"; }}
                                      onMouseOut={(e) => { e.target.style.background = "white"; e.target.style.color = "#1f3c88"; }}
                                >
                                  📍 Track
                                </Link>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
                </div>
            </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            {/* ✅ QUICK ACTIONS (With Hover Effects & Toast) */}
            <section style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px" }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#333" }}>⚡ Quick Actions</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                    
                    {/* BUTTON 1 */}
                    <button 
                        onClick={() => navigate('/map')} 
                        style={{ padding: "12px", border: "1px solid #eee", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#555", textAlign: "left", transition: "all 0.2s" }}
                        onMouseOver={(e) => { e.target.style.background = "#e3f2fd"; e.target.style.color = "#1565c0"; }}
                        onMouseOut={(e) => { e.target.style.background = "#f8f9fa"; e.target.style.color = "#555"; }}
                    >
                        🗺️ View Live Map
                    </button>

                    {/* BUTTON 2 */}
                    <button 
                        onClick={() => navigate('/search')} 
                        style={{ padding: "12px", border: "1px solid #eee", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#555", textAlign: "left", transition: "all 0.2s" }}
                        onMouseOver={(e) => { e.target.style.background = "#e3f2fd"; e.target.style.color = "#1565c0"; }}
                        onMouseOut={(e) => { e.target.style.background = "#f8f9fa"; e.target.style.color = "#555"; }}
                    >
                        🔍 Search Vessel Database
                    </button>
                    
                    {/* BUTTON 3 (WITH TOAST) */}
                    <button 
                        onClick={() => showToast("Daily Report generated successfully!")} 
                        style={{ padding: "12px", border: "1px solid #eee", background: "#f8f9fa", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#555", textAlign: "left", transition: "all 0.2s" }}
                        onMouseOver={(e) => { e.target.style.background = "#e3f2fd"; e.target.style.color = "#1565c0"; }}
                        onMouseOut={(e) => { e.target.style.background = "#f8f9fa"; e.target.style.color = "#555"; }}
                    >
                        📊 Generate Daily Report
                    </button>

                </div>
            </section>

            {/* ALERTS PANEL */}
            <section style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", color: "#333" }}>🔔 Live Alerts</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                    {stats?.high_congestion_ports > 0 && (
                        <div style={{ background: "#ffebee", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #ef5350" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#c62828", marginBottom: "4px" }}>High Congestion Detected</div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#b71c1c" }}>UNCTAD Index &gt; 85% at major hubs.</p>
                            <small style={{ color: "#e57373", fontSize: "0.75rem", marginTop: "5px", display: "block" }}>Just now</small>
                        </div>
                    )}
                    {stats?.active_risks > 0 && (
                          <div style={{ background: "#fff3e0", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #ffa726" }}>
                            <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#ef6c00", marginBottom: "4px" }}>Safety Zone Warning</div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#e65100" }}>Vessels approaching Weather Risk zones.</p>
                            <small style={{ color: "#ffb74d", fontSize: "0.75rem", marginTop: "5px", display: "block" }}>10 mins ago</small>
                        </div>
                    )}
                    <div style={{ background: "#e8f5e9", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #66bb6a" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#2e7d32", marginBottom: "4px" }}>System Update</div>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#1b5e20" }}>AIS Stream connected successfully.</p>
                        <small style={{ color: "#81c784", fontSize: "0.75rem", marginTop: "5px", display: "block" }}>2 hours ago</small>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </main>
  );
}