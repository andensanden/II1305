import { useEffect, useState } from 'react'
import { useMap, Circle, Polyline, Polygon } from 'react-leaflet'

const nodeRadius = 20;

/*
    Handles what happens when the user clicks on the map
*/
function MapClick() {
    const map = useMap()
    const [nodes, setNodes] = useState([])
    const [paths, setPaths] = useState([])
    const [bufferZones, setBufferZones] = useState([])

    const onMapClick = (e) => {
        AddNode(e, setNodes)
    }

    // Update paths whenever nodes is updated
    useEffect(() => {
        if (nodes.length > 1) {
            AddPath(nodes[nodes.length-2], nodes[nodes.length-1], setPaths)
            AddBufferZone(nodes[nodes.length-2], nodes[nodes.length-1], setBufferZones)
        }
    }, [nodes])

    useEffect(() => {
        map.on('click', onMapClick) 

        return () => {
            map.off('click', onMapClick)
        }
    }, [map])

    return (
        <>
            <DrawNodes nodes={nodes}/>
            <DrawPaths paths={paths}/>
            <DrawBufferZones bufferZones={bufferZones}/>
        </>
    )
}

/*
    Add a new node to the array of nodes
*/
function AddNode(e, setNodes) {
    const newNode = {
        position: e.latlng,
        radius: nodeRadius,
    }
    setNodes((prevNodes) => [...prevNodes, newNode])
}

/*
    Draws the existing nodes on the map
*/
function DrawNodes({nodes}) {
    return (
        <>
            {nodes.map((node, index) => { return(
                <Circle 
                key={index} center={node.position} radius={node.radius}
                color="blue" fillColor="blue" fillOpacity={0.5}/>
                )
            })}
        </>
    )
}

/*
    Add a new path to the array of paths
*/
function AddPath(startNode, endNode, setPaths) {
    const newPath = [startNode.position, endNode.position]
    setPaths((prevPaths) => [...prevPaths, newPath])
}

/*
    Draws the existing paths on the map
*/
function DrawPaths({paths}) {
    return (
        <>
            {paths.map((path, index) => { return(
                <Polyline 
                key={index} positions={path}
                color="blue" weight={1}/>
                )
            })}
        </>
    )
}

/*
    Add a new buffer zone to the buffer zone array
*/
function AddBufferZone(startNode, endNode, setBufferZones) {
    const bufferWidth = 40;
    const newZone = CreateBufferCoords([startNode.position, endNode.position], bufferWidth)
    setBufferZones((prevZones) => [...prevZones, newZone])
}

/*
    Draws the existing buffer zones on the map
*/
function DrawBufferZones({bufferZones}) {
    return (
        <>
            {bufferZones.map((zone, index) => { return(
                <Polygon 
                key={index} positions={zone}
                color="blue" fillOpacity={0.3} weight={1}/>
                )
            })}
        </>
    )
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

export default MapClick