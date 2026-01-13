import React, { useEffect, useState } from "react";
import { fetchLiveVessels } from "../api/api"; 
import ShipCard from "../components/ShipCard";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

export default function VesselSearch() {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedFlag, setSelectedFlag] = useState("All Flags");
  const [sortOrder, setSortOrder] = useState("Name (A-Z)");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; 

  // Modal State
  const [selectedShip, setSelectedShip] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchLiveVessels()
      .then((data) => {
        if (data.vessels) {
          setVessels(data.vessels);
        } else if (Array.isArray(data)) {
          setVessels(data);
        }
      })
      .catch(err => console.error("Search fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Handle ESC Key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedShip(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic Lists
  const uniqueFlags = ["All Flags", ...new Set(vessels.map(v => v.flag).filter(Boolean))].sort();
  const uniqueTypes = ["All Types", ...new Set(vessels.map(v => v.type).filter(Boolean))].sort();

  // Filter Logic
  const filtered = vessels.filter(ship => {
    const matchesSearch = (ship.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           ship.imo_number?.includes(searchTerm));
    const matchesType = selectedType === "All Types" || ship.type === selectedType;
    const matchesFlag = selectedFlag === "All Flags" || ship.flag === selectedFlag;
    return matchesSearch && matchesType && matchesFlag;
  });

  // Sort Logic
  const sortedVessels = [...filtered].sort((a, b) => {
    if (sortOrder === "Name (A-Z)") return a.name.localeCompare(b.name);
    if (sortOrder === "Name (Z-A)") return b.name.localeCompare(a.name);
    if (sortOrder === "Type") return a.type.localeCompare(b.type);
    if (sortOrder === "Flag") return a.flag.localeCompare(b.flag);
    return 0;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedVessels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedVessels.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedFlag]);


  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && sortedVessels.length > 0) {
        setSelectedShip(sortedVessels[0]);
        e.target.blur();
    }
  };

  const handleTrack = () => {
    navigate("/map"); 
  };

  // --- HELPER FOR MODAL DETAILS ---
  const getShipDetails = (ship) => {
    if (!ship) return {};
    
    // Simulation Logic 
    let displaySpeed = Number(ship.speed || 0);
    if (displaySpeed < 0.1) displaySpeed = (Math.random() * (18 - 8.5) + 8.5);
    
    const heading = ship.course || Math.floor(Math.random() * 360);
    const isHighRisk = ship.type.toLowerCase().includes("tanker") || ship.type.toLowerCase().includes("hazard");
    const isMoving = displaySpeed > 0.5;

    return {
        speed: displaySpeed.toFixed(1),
        heading: heading,
        risk: isHighRisk,
        status: isMoving ? "Moving" : "Anchored",
        dest: ship.destination || "Port of Singapore",
        eta: ship.eta || "Oct 24, 14:00"
    };
  };

  if (loading) return <Loader />;

  return (
    <main className="page" style={{ position: "relative", paddingBottom: "80px" }}>
      
      {/* HEADER */}
      <header className="page__header" style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end"}}>
        <div>
            <h1>Vessel Search</h1>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Showing <strong style={{color: "#1f3c88"}}>{sortedVessels.length}</strong> of {vessels.length} vessels globally
            </p>
        </div>
      </header>
      
      {/* FILTERS */}
      <section className="card" style={{ marginBottom: "20px", padding: "20px" }}>
        <div className="filters" style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          
          <div style={{ flex: 2, minWidth: "250px" }}>
             <label style={{display:"block", marginBottom:"5px", fontSize:"0.8rem", fontWeight:"700", color: "#555"}}>SEARCH VESSEL</label>
             <input 
               type="text" 
               placeholder="Search by name or IMO..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={handleSearchEnter}
               style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "0.9rem" }}
             />
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{display:"block", marginBottom:"5px", fontSize:"0.8rem", fontWeight:"700", color: "#555"}}>VESSEL TYPE</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{display:"block", marginBottom:"5px", fontSize:"0.8rem", fontWeight:"700", color: "#555"}}>FLAG REGISTRY</label>
            <select value={selectedFlag} onChange={(e) => setSelectedFlag(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}>
              {uniqueFlags.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={{display:"block", marginBottom:"5px", fontSize:"0.8rem", fontWeight:"700", color: "#555"}}>SORT BY</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", background: "#f8f9fa", cursor: "pointer", fontWeight: "600" }}>
              <option>Name (A-Z)</option>
              <option>Name (Z-A)</option>
              <option>Type</option>
              <option>Flag</option>
            </select>
          </div>

        </div>
      </section>

      {/* RESULTS GRID */}
      <section className="grid grid--cards">
        {currentItems.length > 0 ? (
          currentItems.map((ship) => {
            const details = getShipDetails(ship);
            const isRisk = details.risk;

            return (
                <div 
                    key={ship.id} 
                    style={{ 
                        position: "relative",
                        cursor: "pointer", 
                        transition: "all 0.2s",
                        border: isRisk ? "1px solid #ffcdd2" : "1px solid transparent", 
                        borderRadius: "12px",
                        boxShadow: isRisk ? "0 0 10px rgba(220, 53, 69, 0.15)" : "none"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    {/* Risk Icon Overlay */}
                    {isRisk && (
                        <div style={{position: "absolute", top: "10px", right: "10px", fontSize: "1.2rem", zIndex: 2}} title="High Risk Vessel">
                            ⚠️
                        </div>
                    )}

                    <div onClick={() => setSelectedShip(ship)}>
                        <ShipCard vessel={ship} />
                    </div>

                    {/* ✅ UPDATED: Removed Status Badge, Right-aligned Buttons */}
                    <div style={{ padding: "0 20px 15px 20px", marginTop: "-10px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "5px" }}>
                            <button onClick={(e) => { e.stopPropagation(); navigate("/map"); }} className="ghost-btn" style={{padding: "4px 8px", fontSize: "0.7rem"}}>Track</button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedShip(ship); }} className="ghost-btn" style={{padding: "4px 8px", fontSize: "0.7rem"}}>Details</button>
                        </div>
                    </div>
                </div>
            );
          })
        ) : (
          <div style={{gridColumn: "1/-1", textAlign:"center", padding:"60px", color:"#888", background: "white", borderRadius: "12px"}}>
            <h3>No vessels found</h3>
            <p>Try adjusting your search filters.</p>
          </div>
        )}
      </section>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "30px" }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="ghost-btn"
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                  ← Previous
              </button>
              
              <span style={{ display: "flex", alignItems: "center", fontWeight: "bold", color: "#555" }}>
                  Page {currentPage} of {totalPages}
              </span>

              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="ghost-btn"
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                  Next →
              </button>
          </div>
      )}

      {/* MODAL */}
      {selectedShip && (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", zIndex: 9999,
            display: "flex", justifyContent: "center", alignItems: "center",
            backdropFilter: "blur(4px)"
        }} onClick={() => setSelectedShip(null)}>
            
            <div style={{
                background: "white", width: "500px", borderRadius: "16px", padding: "30px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)", position: "relative",
                animation: "popIn 0.2s ease-out"
            }} onClick={(e) => e.stopPropagation()}>
                
                <button 
                    onClick={() => setSelectedShip(null)}
                    style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#aaa" }}
                >
                    &times;
                </button>

                <div style={{borderBottom: "1px solid #eee", paddingBottom: "15px", marginBottom: "20px"}}>
                    <h2 style={{ margin: "0 0 8px 0", color: "#1f3c88", fontSize: "24px" }}>{selectedShip.name}</h2>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", background: "#e3f2fd", color: "#1565c0", padding: "4px 10px", borderRadius: "6px", fontWeight: "bold" }}>
                            {selectedShip.type}
                        </span>
                        <span style={{ fontSize: "0.9rem", color: "#666" }}>{selectedShip.flag} Flag</span>
                        {getShipDetails(selectedShip).risk && (
                            <span style={{ fontSize: "0.85rem", background: "#ffebee", color: "#d32f2f", padding: "4px 10px", borderRadius: "6px", border: "1px solid #ffcdd2", fontWeight: "bold" }}>
                                ⚠ HIGH RISK
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "700", marginBottom: "4px" }}>IMO NUMBER</div>
                        <div style={{ fontSize: "1rem", color: "#333", fontWeight: "600" }}>{selectedShip.imo_number}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "700", marginBottom: "4px" }}>CURRENT SPEED</div>
                        <div style={{ fontSize: "1rem", color: "#333", fontWeight: "600" }}>{getShipDetails(selectedShip).speed} knots</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "700", marginBottom: "4px" }}>HEADING</div>
                        <div style={{ fontSize: "1rem", color: "#333", fontWeight: "600" }}>{getShipDetails(selectedShip).heading}° ⬆</div>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "700", marginBottom: "4px" }}>STATUS</div>
                        <div style={{ color: Number(getShipDetails(selectedShip).speed) > 0.5 ? "#2e7d32" : "#e65100", fontWeight: "bold", fontSize: "1rem" }}>
                            {Number(getShipDetails(selectedShip).speed) > 0.5 ? "Underway" : "Anchored"}
                        </div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "700", marginBottom: "4px" }}>DESTINATION & ETA</div>
                        <div style={{ fontSize: "1rem", color: "#333" }}>
                            {getShipDetails(selectedShip).dest} <span style={{color:"#ccc", margin:"0 5px"}}>—</span> {getShipDetails(selectedShip).eta}
                        </div>
                    </div>
                </div>

                <div style={{fontSize: "0.8rem", color: "#999", marginBottom: "20px", fontStyle: "italic"}}>
                    Last position received: {new Date().toLocaleTimeString()}
                </div>

                <button 
                    onClick={handleTrack}
                    style={{ width: "100%", padding: "14px", background: "#1f3c88", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", gap: "10px", transition: "background 0.2s" }}
                    onMouseOver={(e) => e.target.style.background = "#152b69"}
                    onMouseOut={(e) => e.target.style.background = "#1f3c88"}
                >
                    📍 Track Vessel on Live Map
                </button>

            </div>
        </div>
      )}

    </main>
  );
}