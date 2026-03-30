// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AskPage from "./AskPage";
import SceneManager from "./three/SceneManager";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
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
