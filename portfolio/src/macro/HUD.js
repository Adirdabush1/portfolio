import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { isTouchDevice } from "../drive/touch";
const titleStyle = {
    position: "fixed",
    top: 28,
    left: 28,
    color: "#fff",
    fontFamily: "Poppins, system-ui, sans-serif",
    zIndex: 5,
    pointerEvents: "none",
};
const linkRow = {
    position: "fixed",
    top: 18,
    right: 18,
    display: "flex",
    gap: 10,
    zIndex: 6,
};
const link = {
    color: "#fff",
    background: "rgba(8, 12, 16, 0.78)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "Poppins, system-ui, sans-serif",
    letterSpacing: 0.4,
};
const panelStyle = {
    position: "fixed",
    bottom: 24,
    left: 24,
    background: "rgba(8, 12, 16, 0.78)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#fff",
    fontFamily: "Poppins, system-ui, sans-serif",
    fontSize: 13,
    letterSpacing: 0.3,
    backdropFilter: "blur(8px)",
    zIndex: 5,
    pointerEvents: "none",
};
const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    margin: "4px 0",
};
const keyStyle = {
    fontFamily: "JetBrains Mono, ui-monospace, monospace",
    fontWeight: 700,
};
export default function HUD({ onClassic, onDriveCity }) {
    const touchMode = isTouchDevice();
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: titleStyle, children: [_jsx("div", { style: { fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }, children: "Adir's Desk" }), _jsx("div", { style: { fontSize: 13, opacity: 0.7, marginTop: 2 }, children: "A toy car on the workspace where I build things." })] }), _jsxs("div", { style: linkRow, children: [_jsx("button", { style: link, onClick: onDriveCity, children: "Drive city \u2197" }), _jsx("button", { style: link, onClick: onClassic, children: "Classic view \u2197" })] }), !touchMode && (_jsxs("div", { style: panelStyle, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 11, opacity: 0.7, marginBottom: 6 }, children: "CONTROLS" }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { children: "Drive" }), _jsx("span", { style: keyStyle, children: "W A S D" })] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { children: "Hop" }), _jsx("span", { style: keyStyle, children: "SPACE" })] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { children: "Reset" }), _jsx("span", { style: keyStyle, children: "R" })] })] }))] }));
}
