import { isTouchDevice } from "../drive/touch";

interface HUDProps {
  onClassic: () => void;
  onDriveCity: () => void;
}

const titleStyle: React.CSSProperties = {
  position: "fixed",
  top: 28,
  left: 28,
  color: "#fff",
  fontFamily: "Poppins, system-ui, sans-serif",
  zIndex: 5,
  pointerEvents: "none",
};

const linkRow: React.CSSProperties = {
  position: "fixed",
  top: 18,
  right: 18,
  display: "flex",
  gap: 10,
  zIndex: 6,
};

const link: React.CSSProperties = {
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

const panelStyle: React.CSSProperties = {
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

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 24,
  margin: "4px 0",
};

const keyStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono, ui-monospace, monospace",
  fontWeight: 700,
};

export default function HUD({ onClassic, onDriveCity }: HUDProps) {
  const touchMode = isTouchDevice();

  return (
    <>
      <div style={titleStyle}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
          Adir's Desk
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
          A toy car on the workspace where I build things.
        </div>
      </div>

      <div style={linkRow}>
        <button style={link} onClick={onDriveCity}>
          Drive city ↗
        </button>
        <button style={link} onClick={onClassic}>
          Classic view ↗
        </button>
      </div>

      {!touchMode && (
        <div style={panelStyle}>
          <div style={{ fontWeight: 700, fontSize: 11, opacity: 0.7, marginBottom: 6 }}>
            CONTROLS
          </div>
          <div style={rowStyle}>
            <span>Drive</span>
            <span style={keyStyle}>W A S D</span>
          </div>
          <div style={rowStyle}>
            <span>Hop</span>
            <span style={keyStyle}>SPACE</span>
          </div>
          <div style={rowStyle}>
            <span>Reset</span>
            <span style={keyStyle}>R</span>
          </div>
        </div>
      )}
    </>
  );
}
