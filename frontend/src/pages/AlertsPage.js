import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AlertsPage.css"; 

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api"; 

// ✅ HELPER: Parse structured data
const parseMessage = (msg) => {
    const portMatch = msg.match(/Port of (.*?) congestion/i);
    const congMatch = msg.match(/at (\d+%)/);
    const waitMatch = msg.match(/Wait time (\d+\.?\d*h)/);
    
    const congestionVal = congMatch ? parseInt(congMatch[1]) : 0;
    const waitVal = waitMatch ? parseFloat(waitMatch[1]) : 0;

    return {
        port: portMatch ? portMatch[1] : "Unknown Port",
        congestion: congMatch ? congMatch[1] : "N/A",
        congestionVal,
        wait: waitMatch ? waitMatch[1] : "--",
        waitVal,
        isClean: !!(portMatch && congMatch && waitMatch),
        highRiskCongestion: congestionVal > 90,
        highRiskWait: waitVal > 48
    };
};

const formatTime = (isoString) => new Date(isoString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

// ✅ UPDATED: Checks if date is strictly TODAY
const isRecent = (dateString) => {
    const alertDate = new Date(dateString);
    const today = new Date();
    return alertDate.getDate() === today.getDate() &&
           alertDate.getMonth() === today.getMonth() &&
           alertDate.getFullYear() === today.getFullYear();
};

const AlertsPage = () => {
  const navigate = useNavigate();
  
  // ✅ NEW: ROLE STATE (Simulated Login)
  // Options: 'OPERATOR', 'ADMIN', 'ANALYST'
  const [userRole, setUserRole] = useState("OPERATOR"); 

  // Data State
  const [alerts, setAlerts] = useState([]);
  const [pagination, setPagination] = useState({ count: 0, total_pages: 1, current_page: 1 });
  const [stats, setStats] = useState({ critical: 0, warning: 0, total: 0, avg_wait: 0, worst_port: '-' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter/View State
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("newest"); 
  const [viewMode, setViewMode] = useState("comfortable"); 
  const [pageSize, setPageSize] = useState(10); 

  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedAlert, setSelectedAlert] = useState(null); 

  // Persistence
  const [ackedAlerts, setAckedAlerts] = useState(() => JSON.parse(localStorage.getItem("ackedAlerts") || "[]"));
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("alertNotes") || "{}"));

  // --- ACTIONS ---
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // 🔒 SECURITY CHECK: Only Operator can acknowledge
  const handleAcknowledge = useCallback((id) => {
    if (userRole !== 'OPERATOR') {
        showToast("⛔ Permission Denied: Admins/Analysts cannot acknowledge.");
        return; 
    }
    const newAcked = [...ackedAlerts, id];
    setAckedAlerts(newAcked);
    localStorage.setItem("ackedAlerts", JSON.stringify(newAcked));
    showToast("✅ Alert Acknowledged");
  }, [ackedAlerts, userRole]);

  // 🔒 SECURITY CHECK: Analyst cannot edit notes
  const handleAddNote = (id, noteText) => {
    if (userRole === 'ANALYST') return; 
    const updatedNotes = { ...notes, [id]: noteText };
    setNotes(updatedNotes);
    localStorage.setItem("alertNotes", JSON.stringify(updatedNotes));
  };

  // --- LOAD DATA ---
  const loadAlerts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/alerts/?page=${page}&page_size=${pageSize}&severity=${filter}&search=${searchQuery}`, {
          headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      
      let sortedResults = data.results;
      if (sortMode === 'congestion') {
        sortedResults.sort((a, b) => {
            const valA = parseInt(a.message.match(/(\d+)%/) || [0,0][1]);
            const valB = parseInt(b.message.match(/(\d+)%/) || [0,0][1]);
            return valB - valA; 
        });
      }

      setAlerts(sortedResults);
      setPagination(data.pagination);
      setStats(data.stats);
      setSelectedIds([]); 
    } catch (err) { console.error("Load failed", err); }
    finally { setLoading(false); }
  }, [filter, sortMode, searchQuery, pageSize]);

  useEffect(() => { 
      const timer = setTimeout(() => loadAlerts(1), 500); 
      return () => clearTimeout(timer);
  }, [filter, sortMode, searchQuery, pageSize, loadAlerts]);

  useEffect(() => { if (pagination.current_page > 1) loadAlerts(pagination.current_page); }, [pagination.current_page, loadAlerts]);

  // --- BULK ACTIONS ---
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === alerts.length) setSelectedIds([]);
    else setSelectedIds(alerts.map(a => a.id));
  };

  const handleBulkAction = (action) => {
    if (action === 'ack') {
        const newAcked = [...ackedAlerts, ...selectedIds];
        setAckedAlerts(newAcked);
        localStorage.setItem("ackedAlerts", JSON.stringify(newAcked));
        showToast(`✅ ${selectedIds.length} Alerts Acknowledged`);
    } else if (action === 'export') {
        showToast(`📥 Exporting ${selectedIds.length} items to CSV...`);
    } else {
        showToast(`🚀 ${action} action triggered`);
    }
    setSelectedIds([]);
  };

  return (
    <div className="operator-container">
      {toast && <div className="toast-notification">{toast}</div>}

      {/* 1. HEADER & ROLE SWITCHER */}
      <div className="operator-header">
        <div className="header-left">
            <h2>🔔 Command Center</h2>
            <p className="subtext">
                User Role: <strong style={{color: "#2563eb", textTransform: "uppercase"}}>{userRole}</strong> • {stats.total} Events
            </p>
        </div>
        
        {/* 🛠️ ROLE TOGGLE (For Testing) */}
        <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
            <span style={{fontSize: "0.8rem", color: "#666", fontWeight: "600"}}>SWITCH ROLE:</span>
            <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                style={{padding: "6px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", fontWeight: "bold", color: "#333"}}
            >
                <option value="OPERATOR">👨‍✈️ Operator</option>
                <option value="ADMIN">🧑‍💼 Admin</option>
                <option value="ANALYST">📊 Analyst</option>
            </select>
        </div>

        <div className="insight-row">
            {/* ANALYST HUB LINK: Hidden for Operator */}
            {(userRole === 'ANALYST' || userRole === 'ADMIN') ? (
                <div className="insight-card action" onClick={() => navigate('/analyst')}>
                    <span className="insight-label">📈 Deep Dive</span>
                    <span className="insight-val link">Analyst Hub →</span>
                </div>
            ) : (
                <div className="insight-card click" onClick={() => setFilter('critical')}>
                    <span className="insight-label">🚨 Active Critical</span>
                    <span className="insight-val red">{stats.critical}</span>
                </div>
            )}
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="filter-bar">
        <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input"/>
        </div>
        
        <div className="filter-pills">
            <button className={`pill ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>All</button>
            <button className={`pill critical ${filter==='critical'?'active':''}`} onClick={()=>setFilter('critical')}>Critical</button>
            <button className={`pill warning ${filter==='warning'?'active':''}`} onClick={()=>setFilter('warning')}>Warning</button>
        </div>

        <div className="view-controls">
            <select value={sortMode} onChange={e => setSortMode(e.target.value)} className="sort-select">
                <option value="newest">Sort: Newest ↓</option>
                <option value="congestion">Sort: Congestion 🔥</option>
                <option value="severity">Sort: Severity 🚨</option>
            </select>
            <div className="density-toggle">
                <span className={viewMode==='comfortable'?'active':''} onClick={()=>setViewMode('comfortable')}>Comfort</span>
                <span className={viewMode==='compact'?'active':''} onClick={()=>setViewMode('compact')}>Compact</span>
            </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className={`dashboard-grid ${selectedAlert ? 'split-view' : ''}`}>
        
        {/* LEFT: ALERT LIST */}
        <div className="alert-feed-section">
            
            {/* BULK ACTIONS: OPERATOR (Ack/Assign) */}
            {selectedIds.length > 0 && userRole === 'OPERATOR' && (
                <div className="bulk-toolbar">
                    <span className="count">{selectedIds.length} Selected</span>
                    <div className="bulk-btns">
                        <button onClick={() => handleBulkAction('ack')}>✅ Acknowledge</button>
                        <button onClick={() => handleBulkAction('assign')}>👤 Assign</button>
                    </div>
                    <button className="clear-btn" onClick={() => setSelectedIds([])}>Clear</button>
                </div>
            )}
            
            {/* BULK ACTIONS: ADMIN/ANALYST (Export Only) */}
            {selectedIds.length > 0 && userRole !== 'OPERATOR' && (
                 <div className="bulk-toolbar" style={{background: "#475569"}}>
                    <span className="count">{selectedIds.length} Selected</span>
                    <div className="bulk-btns">
                        <button onClick={() => handleBulkAction('export')}>📥 Export Data</button>
                    </div>
                    <button className="clear-btn" onClick={() => setSelectedIds([])}>Clear</button>
                </div>
            )}

            <div className="table-header">
                <div className="col-check">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === alerts.length && alerts.length > 0}/>
                </div>
                <div className="col-sev">Sev</div>
                <div className="col-main">Event Details</div>
                <div className="col-meta">Time</div>
            </div>

            {loading ? <div className="loading-skeleton">Loading...</div> : (
                <div className={`alerts-list ${viewMode}`}>
                    {alerts.map((alert) => {
                        const isAcked = ackedAlerts.includes(alert.id);
                        const isSelected = selectedIds.includes(alert.id);
                        const isActive = selectedAlert?.id === alert.id;
                        const { port, congestion, highRiskCongestion } = parseMessage(alert.message);

                        return (
                            <div 
                                key={alert.id} 
                                className={`alert-row ${alert.severity} ${isActive ? 'active-row' : ''} ${isAcked ? 'acked' : ''}`}
                                onClick={() => setSelectedAlert(alert)}
                            >
                                <div className="row-check" onClick={e => { e.stopPropagation(); toggleSelect(alert.id); }}>
                                    <input type="checkbox" checked={isSelected} readOnly />
                                </div>
                                <div className="row-severity">
                                    <div className={`sev-dot ${alert.severity}`} title={alert.severity.toUpperCase()}></div>
                                </div>
                                <div className="row-content">
                                    <div className="row-top">
                                        <span className="row-port">{port !== "Unknown Port" ? port : alert.vessel_name}</span>
                                        {highRiskCongestion && <span className="tag red">🔥 {congestion}</span>}
                                        {isRecent(alert.timestamp) && !isAcked && <span className="tag new">NEW</span>}
                                    </div>
                                    <div className="row-msg">{alert.message}</div>
                                </div>
                                <div className="row-meta">
                                    <span className="row-time">{formatTime(alert.timestamp)}</span>
                                    {isAcked && <span className="icon-check">✅</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="pagination-bar">
                <div className="page-size-selector">
                    <span>Rows:</span>
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <span className="showing-text">Showing {((pagination.current_page-1)*pageSize)+1}–{Math.min(pagination.current_page*pageSize, pagination.count)} of {pagination.count}</span>
                <div className="page-controls">
                    <button disabled={pagination.current_page === 1} onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}>Prev</button>
                    <button disabled={pagination.current_page === pagination.total_pages} onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}>Next</button>
                </div>
            </div>
        </div>

        {/* RIGHT: DETAILS PANEL (Role Aware) */}
        {selectedAlert && (
            <div className="details-panel slide-in">
                <div className="panel-header">
                    <h3>Alert Details</h3>
                    <button className="close-btn" onClick={() => setSelectedAlert(null)}>×</button>
                </div>
                
                <div className="panel-content">
                    <div className={`status-banner ${selectedAlert.severity}`}>
                        {selectedAlert.severity.toUpperCase()}
                    </div>
                    
                    <div className="detail-group">
                        <label>Message</label>
                        <p className="detail-msg">{selectedAlert.message}</p>
                    </div>

                    {/* NOTES SECTION: Hidden for Analyst, Editable for Op/Admin */}
                    {userRole !== 'ANALYST' && (
                        <div className="detail-group">
                            <label>Operator Notes {userRole === 'ADMIN' && "(Optional)"}</label>
                            <textarea 
                                className="note-input" rows="3" placeholder="Internal notes..."
                                value={notes[selectedAlert.id] || ""}
                                onChange={(e) => handleAddNote(selectedAlert.id, e.target.value)}
                            />
                        </div>
                    )}
                    
                    {/* READ-ONLY NOTES: Visible to Analyst */}
                    {userRole === 'ANALYST' && notes[selectedAlert.id] && (
                         <div className="detail-group">
                            <label>Internal Notes</label>
                            <div style={{background: "#f1f5f9", padding: "10px", borderRadius: "6px", fontSize: "0.9rem", color: "#334155"}}>
                                {notes[selectedAlert.id]}
                            </div>
                         </div>
                    )}

                    <div className="panel-actions">
                        <button className="action-btn map" onClick={() => navigate('/map')}>📍 Locate on Map</button>
                        
                        {/* ACKNOWLEDGE: Only for OPERATOR */}
                        {userRole === 'OPERATOR' && !ackedAlerts.includes(selectedAlert.id) && (
                            <button className="action-btn ack" onClick={() => handleAcknowledge(selectedAlert.id)}>✅ Acknowledge</button>
                        )}
                        
                        {/* EXPORT: Only for ADMIN & ANALYST */}
                        {(userRole === 'ADMIN' || userRole === 'ANALYST') && (
                            <button className="action-btn" style={{background: "#475569", color: "white"}} onClick={() => showToast("📥 Exporting Report...")}>📥 Export PDF</button>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AlertsPage;
