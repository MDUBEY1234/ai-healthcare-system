// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RippleGrid from "./components/UI/RippleGrid";

function App() {
  const [dashboardView, setDashboardView] = useState("main");

  return (
    <Router>
      {/* Background RippleGrid - fixed position, z-index -1 */}
      <RippleGrid
        gridColor="#3b82f6"
        rippleIntensity={0.03}
        gridSize={10}
        gridThickness={15}
        opacity={0.6}
        mouseInteraction={true}
        mouseInteractionRadius={1.2}
        fadeDistance={1.5}
        vignetteStrength={1.5}
        glowIntensity={0.2}
      />

      {/* Main content wrapper with proper z-index */}
      
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          backgroundColor: "transparent",
        }}
      >
        <Navbar view={dashboardView} setView={setDashboardView} />
        <main style={{ backgroundColor: "transparent" }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage
                    view={dashboardView}
                    setView={setDashboardView}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
// see the starting page of registration top health ai , and the centre part of moving