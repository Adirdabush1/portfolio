import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./HomePage";
import AskPage from "./AskPage";
import SceneManager from "./three/SceneManager";
import "./App.css";
const fallback = _jsx("div", { style: { background: "#0a0f0f", position: "fixed", inset: 0 } });
const DrivePortfolio = lazy(() => import("./drive/DrivePortfolio"));
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Suspense, { fallback: fallback, children: _jsx(DrivePortfolio, {}) }) }), _jsx(Route, { path: "/classic", element: _jsxs("div", { className: "background-wrapper", children: [_jsx(SceneManager, {}), _jsx(HomePage, {})] }) }), _jsx(Route, { path: "/ask", element: _jsx(AskPage, {}) })] }) }));
}
