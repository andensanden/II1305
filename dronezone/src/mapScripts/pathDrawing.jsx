import { useEffect, useState, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { Node } from './node.js'
import { DrawNodes, DrawPaths, DrawBufferZones } from './drawFunctions.jsx'
import { wouldLineIntersectForbiddenZone } from './intersectHandler.js'
import { useZones } from './ZonesContext.jsx'

/*
    Handles what happens when the user clicks on the map
*/
function MapClick({ drawingMode }) {
    const map = useMap();
    const doNotDraw = useRef(false);
    const [nodes, setNodes] = useState([]);
    const [paths, setPaths] = useState([]);
    const [bufferZones, setBufferZones] = useState([]);
    const { zones } = useZones();

    const onMapClick = (e) => {
        if (drawingMode === 'path') {
        // Only create a new node upon clicking map, not buttons or other UI elements
        if (!e.originalEvent.target.classList.contains("leaflet-container")
            && !e.originalEvent.target.classList.contains("map-clickable")) return;

            const newNode = new Node(e.latlng);
            newNode.addNode(nodes, setNodes);
        }
        else if (drawingMode === 'remove') {
            if (nodes.length === 0) return;
            for (var i = 0; i < nodes.length; i++) {
                let dist = e.latlng.distanceTo(nodes[i].position);
                if (dist <= nodes[i].radius) {
                    doNotDraw.current = true;
                    nodes[i].removeNode(i, setNodes);
                    RemovePath(i-1, setPaths);
                    RemoveBufferZone(i-1, setBufferZones);
                }
            }
        }
    }

    // Update paths whenever nodes is updated
    useEffect(() => {
        if(doNotDraw.current){
            doNotDraw.current = false;
            return;
        }

        let n = nodes[nodes.length-1];
        // Check if nodes overlap
        if (n) {
            let overlapNode = n.overlapNode(nodes);
            if (overlapNode) {
                n.position = overlapNode.position;
                n.visible = false;
            }
        }

        if (nodes.length > 1) {
            const last = nodes[nodes.length - 2];
            const current = nodes[nodes.length - 1];
            const coords = nodes.slice(0, -1).map(n => n.position);
        
            const blocked = wouldLineIntersectForbiddenZone(current.position, coords, zones);
        
            if (!blocked) {
                AddPath(last, current, setPaths);
                AddBufferZone(last, current, setBufferZones);
            } else {
                console.warn(" Path segment intersects red zone, Removing last node.");
                doNotDraw.current = true;
                nodes[nodes.length - 1].removeNode(nodes.length - 1, setNodes);
                alert("Path intersects forbidden zone — node removed.");
            }
        }
        
    }, [nodes])

    useEffect(() => {
        map.on('click', onMapClick) 

        return () => {
            map.off('click', onMapClick)
        }
    }, [map, drawingMode])

    return (
        <>
            <DrawNodes nodes={nodes} color="blue"/>
            <DrawPaths paths={paths}/>
            <DrawBufferZones bufferZones={bufferZones}/>

            <div className="undo-button" style={{
                        position: 'absolute',
                        top: '78%',
                        right: '0%',
                        zIndex: 1000,
                    }}>
                        <button
                            onClick={() => undo(nodes, setNodes, paths, setPaths, bufferZones, setBufferZones, doNotDraw) }
            
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'grey',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px 0 0 4px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                            }}
            
                        >
                            Undo
                        </button>
                    </div>
        </>
    )
}

/*
    Add a new path to the array of paths
*/
function AddPath(startNode, endNode, setPaths) {
    const newPath = [startNode.position, endNode.position];
    setPaths((prevPaths) => [...prevPaths, newPath]);
}

function RemovePath(index, setPaths) {
    setPaths((prevPaths) => prevPaths.filter((_, i) => i !== index));
    //setPaths((prevPaths) => prevPaths.splice(index, 1));
}

/*
    Add a new buffer zone to the buffer zone array
*/
function AddBufferZone(startNode, endNode, setBufferZones) {
    const bufferWidth = 40;
    const newZone = CreateBufferCoords([startNode.position, endNode.position], bufferWidth);
    setBufferZones((prevZones) => [...prevZones, newZone]);
}

function RemoveBufferZone(index, setBufferZones) {
    setBufferZones((prevBuffer) => prevBuffer.filter((_, i) => i !== index));
    //setBufferZones((prevBuffer) => prevBuffer.splice(index, 1));
}

/*
    Calculates the offset of the buffer zone coordinates from the path between the nodes.
    These coordinates are used in AddBufferZone to create the polygon.
*/
function CreateBufferCoords(coords, widthMeters) {
    if (coords.length < 2) return [];
    
    const halfWidth = widthMeters / 2 / 111320; // Approx meters to degrees
    let leftSide = [];
    let rightSide = [];
    
    const p1 = coords[0];
    const p2 = coords[1];
    const angle = Math.atan2(p2.lat - p1.lat, p2.lng - p1.lng);
    const perpAngle = angle + Math.PI/2;
    
    // Calculate offset points
    leftSide.push([
        p1.lat + Math.sin(perpAngle) * halfWidth,
        p1.lng + Math.cos(perpAngle) * halfWidth
    ]);
    rightSide.push([
        p1.lat - Math.sin(perpAngle) * halfWidth,
        p1.lng - Math.cos(perpAngle) * halfWidth
    ]);
    leftSide.push([
        p2.lat + Math.sin(perpAngle) * halfWidth,
        p2.lng + Math.cos(perpAngle) * halfWidth
    ]);
    rightSide.push([
        p2.lat - Math.sin(perpAngle) * halfWidth,
        p2.lng - Math.cos(perpAngle) * halfWidth
    ]);
    
    return leftSide.concat(rightSide.reverse());
}

function undo(nodes, setNodes, paths, setPaths, bufferZones, setBufferZones, doNotDraw) {
    doNotDraw.current = true;
    nodes[nodes.length - 1].removeNode(nodes.length - 1, setNodes);
    RemovePath(paths.length - 1, setPaths);
    RemoveBufferZone(bufferZones.length - 1, setBufferZones);
}

export default MapClick;