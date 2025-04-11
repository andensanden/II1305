import { Dronepath } from "./dronepath";
import { useNodes } from "./nodesContext";

function LaunchButton({ setDrawingMode }) {
  const { nodes } = useNodes();

  return (
      <div className="launch-button" style={{
          position: 'absolute',
          top: '85%',
          right: '50%',
          zIndex: 1000,
        }}>
          <button 
            onClick={() => Launch(nodes, setDrawingMode)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px 0 0 4px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
          >
            Launch
          </button>
      </div>
  )
}

function Launch(nodes, setDrawingMode) {
    const dronepath = new Dronepath(1);
    for (var node in nodes) {
      dronepath.addNode(node);
    }
    setDrawingMode('launched');
    alert("Dronepath added to user: " + dronepath.owner + ". It contains " + dronepath.nodes.length + " nodes.")
}

export default LaunchButton;