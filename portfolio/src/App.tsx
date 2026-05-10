// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./HomePage";
import AskPage from "./AskPage";
import SceneManager from "./three/SceneManager";

import "./App.css";

const fallback = <div style={{ background: "#0a0f0f", position: "fixed", inset: 0 }} />;

const DrivePortfolio = lazy(() => import("./drive/DrivePortfolio"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={fallback}>
              <DrivePortfolio />
            </Suspense>
          }
        />
        <Route
          path="/classic"
          element={
            <div className="background-wrapper">
              <SceneManager />
              <HomePage />
            </div>
          }
        />
        <Route path="/ask" element={<AskPage />} />
      </Routes>
    </BrowserRouter>
  );
}
