import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// --- Import Pages ---
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import VesselSearch from "./pages/VesselSearch";
import ShipDetails from "./pages/ShipDetails";
import VoyageReplay from "./pages/VoyageReplay";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AnalystDashboard from "./pages/AnalystDashboard"; 
import AdminPanel from "./pages/AdminPanel"; 
import AlertsPage from "./pages/AlertsPage"; // ✅ 1. IMPORT THIS

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-container">
        <Routes>
          {/* Login & Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Core App */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/search" element={<VesselSearch />} />
          <Route path="/ship/:id" element={<ShipDetails />} />
          <Route path="/playback" element={<VoyageReplay />} />
          
          {/* ✅ 2. ADD THIS ROUTE */}
          <Route path="/alerts" element={<AlertsPage />} />

          {/* Role-Based Dashboards */}
          <Route path="/analyst" element={<AnalystDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}