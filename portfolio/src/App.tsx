// src/App.jsx
import React from "react";
import HomePage from "./HomePage";
import SceneManager from "./three/SceneManager";

import "./App.css";

export default function App() {
  return (
    <div className="background-wrapper">
      <SceneManager />
      <HomePage />
    </div>
  );
}
