import { useDriveStore } from "./useDriveStore";
import { isTouchDevice } from "./touch";
import { useIsSmall } from "./useIsSmall";

interface HUDProps {
  onTour: () => void;
  onClassic: () => void;
}

export default function HUD({ onTour, onClassic }: HUDProps) {
  const tourActive = useDriveStore((s) => s.tourActive);
  const touchMode = isTouchDevice();
  const small = useIsSmall();

  const safeBottom = "max(16px, env(safe-area-inset-bottom))";
  const safeTop = "max(14px, env(safe-area-inset-top))";

  const titleStyle: React.CSSProperties = {
    position: "fixed",
    top: safeTop,
    left: small ? 14 : 28,
    color: "#fff",
    fontFamily: "Poppins, system-ui, sans-serif",
    zIndex: 5,
    pointerEvents: "none",
    maxWidth: "60vw",
  };

  const cornerLinks: React.CSSProperties = {
    position: "fixed",
    top: safeTop,
    right: small ? 12 : 18,
    display: "flex",
    flexDirection: small ? "column" : "row",
    gap: 8,
    zIndex: 6,
    alignItems: "flex-end",
  };

  const link: React.CSSProperties = {
    color: "#fff",
    background: "rgba(8, 12, 16, 0.78)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: small ? "10px 16px" : "8px 14px",
    borderRadius: 999,
    fontSize: small ? 13 : 12,
    cursor: "pointer",
    fontFamily: "Poppins, system-ui, sans-serif",
    letterSpacing: 0.4,
    minHeight: 40,
    minWidth: 40,
    backdropFilter: "blur(8px)",
  };

  const tourButton: React.CSSProperties = {
    ...link,
    background: tourActive ? "#a93a3a" : "#3aa86b",
    border: "none",
    color: "#fff",
    fontWeight: 600,
    boxShadow: tourActive
      ? "0 4px 14px rgba(169,58,58,0.4)"
      : "0 4px 14px rgba(58,168,107,0.35)",
  };

  const classicButton: React.CSSProperties = {
    color: "#fff",
    background: "linear-gradient(315deg, #55A5FE, #A469FF, #CC5FB8)",
    border: "none",
    padding: small ? "12px 20px" : "11px 22px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Poppins, system-ui, sans-serif",
    letterSpacing: 0.4,
    minHeight: 44,
    boxShadow: "0 6px 18px rgba(118, 95, 224, 0.45)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: safeBottom,
    left: 16,
    background: "rgba(8, 12, 16, 0.78)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 16px",
    color: "#fff",
    fontFamily: "Poppins, system-ui, sans-serif",
    fontSize: 12,
    letterSpacing: 0.3,
    backdropFilter: "blur(8px)",
    zIndex: 5,
    pointerEvents: "none",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    margin: "3px 0",
  };

  const keyStyle: React.CSSProperties = {
    fontFamily: "JetBrains Mono, ui-monospace, monospace",
    fontWeight: 700,
  };

  return (
    <>
      <div style={titleStyle}>
        <div
          style={{
            fontSize: small ? 20 : 28,
            fontWeight: 700,
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          Drive Portfolio
        </div>
        <div style={{ fontSize: small ? 11 : 13, opacity: 0.7, marginTop: 2 }}>
          Inspired by Bruno Simon
        </div>
      </div>

      <div style={cornerLinks}>
        <button style={tourButton} onClick={onTour}>
          {tourActive ? "Skip Tour" : "Tour Mode"}
        </button>
        <button style={classicButton} onClick={onClassic}>
          <span>📋</span>
          <span>Read instead</span>
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
            <span>Bounce</span>
            <span style={keyStyle}>SPACE</span>
          </div>
          <div style={rowStyle}>
            <span>Reset</span>
            <span style={keyStyle}>R</span>
          </div>
          <div style={rowStyle}>
            <span>Open sign</span>
            <span style={keyStyle}>E</span>
          </div>
        </div>
      )}
    </>
  );
}
