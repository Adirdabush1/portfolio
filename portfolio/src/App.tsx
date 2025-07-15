// src/App.jsx
import React from "react";
import HomePage from "./HomePage";
import UseScrollAnimation from "./useScrollAnimation"; 

import "./App.css";

export default function App() {
  return (
    <div className="background-wrapper">
      <UseScrollAnimation />
      <HomePage />
    </div>
  );
}
