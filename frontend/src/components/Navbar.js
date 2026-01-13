import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; 
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const rawRole = localStorage.getItem("userRole");
  const userRole = rawRole ? rawRole.toLowerCase() : "";
  
  const isLoggedIn = !!localStorage.getItem("access_token");

  if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); 
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span role="img" aria-label="ship" className="navbar__logo">🚢</span>
        Marine Analytics
      </div>

      <div className="navbar__links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/map">Map</NavLink>
        <NavLink to="/search">Vessels</NavLink>
        
        {/* ✅ ALERTS is now beside VOYAGE REPLAY */}
        <NavLink to="/playback">Voyage Replay</NavLink>
        <NavLink to="/alerts">Alerts</NavLink>

        {/* SHOW FOR ANALYSTS */}
        {userRole === "analyst" && (
          <NavLink to="/analyst" className="special-link">Analyst Hub</NavLink>
        )}

        {/* SHOW FOR ADMINS */}
        {userRole === "admin" && (
           <NavLink to="/admin-panel" className="nav-link-admin">Admin Control</NavLink>
        )}

        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <>
            <NavLink to="/">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}