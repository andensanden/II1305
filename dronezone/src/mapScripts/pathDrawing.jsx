import { useEffect, useState, useRef } from 'react'
import { useMap, Popup } from 'react-leaflet'
import { Node } from './node.js'
import { DrawNodes, DrawPaths, DrawBufferZones } from './drawFunctions.jsx'
import { wouldLineIntersectForbiddenZone } from './intersectHandler.js'
import { useZones } from './ZonesContext.jsx'
import { useNodes } from './nodesContext.jsx'
import { CreateDronepath } from './dronepathHandler.jsx'
import { useDronepaths } from './dronepathsContext.jsx'

/*
    Handles what happens when the user clicks on the map
    Rename to PathDrawing
*/
function MapClick({ drawingMode, isLaunched }) {
    const [popupPos, setPopupPos] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const map = useMap();
    const [paths, setPaths] = useState([]);
    const [bufferZones, setBufferZones] = useState([]);
    const { nodes, setNodes } = useNodes();
    const { zones } = useZones();
    const nodesRef = useRef(nodes);
    const zonesRef = useRef(zones);
    const { addDronepath } = useDronepaths();

    const onMapClick = (e) => {
        if (drawingMode === 'path') {
            if (ClickOnUIElement(e)) return;

            if (PathIntersectsForbiddenZone(e, nodesRef, zonesRef)) {
                setPopupPos(e.latlng);
                setShowPopup(true);
                return;
            }

            CreateNode(e, setNodes);
        }
        else if (drawingMode === 'remove') {
           RemoveNode(e, nodes, setNodes);
        }
    }

    usePathAndBuffer(nodes, setPaths, setBufferZones);

    useMapClickListener(map, drawingMode, onMapClick);

    useSyncedRef(nodesRef, nodes);
    useSyncedRef(zonesRef, zones);

    useLaunch(isLaunched, nodes, addDronepath, setNodes);

    return (
        <>
            <DrawNodes nodes={nodes} color="blue"/>
            <DrawPaths paths={paths} color="blue"/>
            <DrawBufferZones bufferZones={bufferZones} color="blue"/>
            {showPopup && popupPos && (
            <Popup position={popupPos} onClose={() => setShowPopup(false)}>
                ⚠️ You cannot draw through or on a red zone ⚠️.
            </Popup>
            )}
        </>
    )
}

function CreateNode(e, setNodes) {
    const newNode = new Node(e.latlng);
    newNode.addNode(setNodes);
}

function RemoveNode(e, nodes, setNodes) {
    const index = nodes.findIndex(node => e.latlng.distanceTo(node.position) <= node.radius);
    if (index === -1) return;

    for (var node in nodes) {
        if (ClickOnNode(e, node)) {
            node.removeNode(setNodes);
        }
    }
}

/**
 * Checks if path would intersect a forbidden zone.
 * @param {*} e 
 * @param {*} nodesRef 
 * @param {*} zonesRef 
 * @returns True if path intersects a forbidden zone.
 */
function PathIntersectsForbiddenZone(e, nodesRef, zonesRef) {
    const coords = nodesRef.current.map(n => n.position);
    return wouldLineIntersectForbiddenZone(e.latlng, coords, zonesRef.current);
}

function ClickOnUIElement(e) {
    if (e.originalEvent.target.classList.contains("leaflet-container")) {
        return false;
    }
    else if (e.originalEvent.target.classList.contains("map-clickable")) {
        return false;
    }
    return true;
}

/**
 * Creates paths and buffer zones when nodes are added or removed.
 * @param {*} nodes 
 * @param {*} setPaths 
 * @param {*} setBufferZones 
 */
function usePathAndBuffer(nodes, setPaths, setBufferZones) {
    useEffect(() => {
        let n = nodes[nodes.length-1];
        // Check if nodes overlap
        if (n) {
            let overlapNode = n.overlapNode(nodes);
            if (overlapNode) {
                n.position = overlapNode.position;
                n.visible = false;
            }
        }

        // Create a path between two nodes
        if (nodes.length > 1) {
            BuildPath(nodes, setPaths);
            BuildBuffer(nodes, setBufferZones);
        } else { // if nodes are less than 1, there should be no paths or bufferzones
            setPaths([]);
            setBufferZones([]);
        }
    }, [nodes]);
}

/**
 * Attaches a map click listener.
 * @param {*} map 
 * @param {*} drawingMode 
 * @param {*} onMapClick 
 */
function useMapClickListener(map, drawingMode, onMapClick) {
    useEffect(() => {
        map.on('click', onMapClick) 

        return () => {
            map.off('click', onMapClick)
        }
    }, [map, drawingMode]);
}

/**
 * Keeps a reference synchronized with a value.
 * @param {*} ref 
 * @param {*} value 
 */
function useSyncedRef(ref, value) {
    useEffect(() => {
        ref.current = value;
    }, [value]);
}

function useLaunch(isLaunched, nodes, addDronepath, setNodes) {
    useEffect(() => {
        if (isLaunched) {
            CreateDronepath(nodes, addDronepath);
            setNodes([]);
        }
    }, [isLaunched]);
}

/*
    Builds the path based on the existing nodes
*/
function BuildPath(nodes, setPaths) {
    const path = [];
    for (var i = 0; i < nodes.length-1; i++) {
        path.push([nodes[i].position, nodes[i+1].position]);
    }
    setPaths(path);
}

/*
    Builds the buffer zone based on the existing nodes
*/
function BuildBuffer(nodes, setBufferZones) {
    const buffer = [];
    const bufferWidth = 40;
    for (var i = 0; i < nodes.length-1; i++) {
        buffer.push(CreateBufferCoords([nodes[i].position, nodes[i+1].position], bufferWidth));
    }
    setBufferZones(buffer);
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

function ClickOnNode(e, node) {
    const dist = e.latlng.distanceTo(node.position);
    return dist <= node.radius;
}

export default MapClick;