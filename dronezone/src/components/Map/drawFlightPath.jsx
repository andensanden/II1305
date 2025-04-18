import { GiPathDistance } from "react-icons/gi";
import { useNodes } from "@/mapScripts/nodesContext";
import { useEffect } from "react";
import UndoButton from "@/mapScripts/undoButton";

export function DrawFlightPathMenu({
  flightPathMenuOpen,
  onToggleMenu,
  setFlightPathMenuOpen,
  setDevicesMenuOpen,
  confirmFlightPath,
  setConfirmFlightPath,
  setDrawingMode,
  bottom,
}) {
  const { undoLastNode, nodes, clearNodes } = useNodes();

  useEffect(() => {
    if (!flightPathMenuOpen && !confirmFlightPath) {
      setDrawingMode(null); // B3 = 0
    } else if (flightPathMenuOpen && !confirmFlightPath) {
      setDrawingMode("path"); // B3 = 1
    } else if (flightPathMenuOpen && confirmFlightPath) {
      setDrawingMode(null); // B3 = 0
    }
  }, [flightPathMenuOpen, confirmFlightPath, setDrawingMode]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: `${bottom}px`, // ✅ use dynamic value from parent
        left: "20px",
        zIndex: 1000,
        transition: "bottom 0.5s ease",
      }}
    >
      <button
        onClick={() => {
          onToggleMenu();
          setFlightPathMenuOpen(!flightPathMenuOpen);
          setDevicesMenuOpen(false);
        }}
        style={{
          background: "#FFD700",
          padding: "10px 16px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <span>Draw Flight Path</span>
        <GiPathDistance size={24} />
      </button>

      {flightPathMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "0",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
            width: "260px",
            overflow: "hidden",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ padding: "12px 16px" }}>
            <div
              style={{
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ddd",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <span>Confirm Flight Path</span>
              <input
                type="checkbox"
                checked={confirmFlightPath}
                onChange={() => {
                  setConfirmFlightPath(!confirmFlightPath);
                }}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#FFD700",
                }}
              />
            </div>

            <div
              onClick={undoLastNode} // Step 3 ✅
              style={{
                fontWeight: "bold",
                fontSize: "14px",
                margin: "12px 0",
                cursor: nodes.length > 0 ? "pointer" : "not-allowed",
              }}
            >
              <UndoButton />
            </div>

            <div
              onClick={clearNodes}
              style={{
                color: "red",
                fontWeight: "bold",
                fontSize: "14px",
                margin: "12px 0",
                cursor: "pointer",
              }}
            >
              Clear Selection
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
