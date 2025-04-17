import { useEffect, useState, useRef } from "react";
import { Dronepath } from "./dronepath";
import { DrawNodes, DrawPaths, DrawBufferZones } from './drawFunctions.jsx'
import { Node } from "./node";
import { useDronepaths } from "./dronepathsContext";
import L from "leaflet";

/**
 * Fetches and sends all dronepaths to and from the database.
 * @returns Draws all dronepaths on the map.
 */
export function DronepathHandler() {
    const { dronepaths, addDronepath } = useDronepaths();

    // Temporary for testing
    const [dronepathTest] = useState(() => {
        const path = new Dronepath(1);
        path.addNode(new Node(L.latLng(59.3250, 18.0708)));
        path.addNode(new Node(L.latLng(59.3470, 18.0726)));
        path.addNode(new Node(L.latLng(59.3326, 18.0649)));
        return path;
    });

    const [dronepathTest2] = useState(() => {
        const path = new Dronepath(1, "green");
        path.addNode(new Node(L.latLng(59.3275, 18.0546)));
        path.addNode(new Node(L.latLng(59.3178, 18.0845)));
        path.addNode(new Node(L.latLng(59.3240, 18.1030)));
        return path;
    });
    

    // Run once on initial mounting of component
    // Use this to fetch all dronepaths
    /*useEffect(() => {
    async function fetchData() {
        const response = await fetch("http://localhost:8080/api/zone/restricted", 
                        {method: "GET", headers: { "Content-Type": "application/json"}});
        const data = await response.json();
        
        data.forEach((dronepathJSON, index) => {
            const newDronepath = createDronepathFromJSON(dronepathJSON);
            setDronepaths((prevPaths) => {
                const newPaths = [...prevPaths, newDronepath];
                return newPaths;
            });
        })
        }
        fetchData();
    }, []);*/

    // Temporary for testing
    useEffect(() => {
            addDronepath(dronepathTest);
            addDronepath(dronepathTest2);
        }, []);

    return (
        <>
            {dronepaths.map((dronepath, index) => (
                <DrawDronepath key={index} dronepath={dronepath} color={dronepath.color}/>
            ))}
        </>
    );
}

/**
 * Adds a new dronepath based on an array of nodes, then sends that dronepath to the database. This is mainly used in pathDrawing for saving a planned path.
 * @param {*} nodes An array of nodes which will be used for the dronepath.
 * @param {*} addDronepath The function (from dronepathsContext) which adds the dronepath to the array of dronepaths.
 */
export function CreateDronepath(nodes, addDronepath) {
    const newDronepath = new Dronepath(1, "blue");
    for (var i = 0; i < nodes.length; i++) {
        console.log(nodes[i].position);
        newDronepath.addNode(nodes[i]);
    }
    addDronepath(newDronepath);
    // Send newDronepath to database
}

/**
 * Draws a dronepath on the map.
 */
function DrawDronepath({ dronepath, color }) {
    return (
        <>
            <DrawNodes nodes={dronepath.nodes} color={color}/>
            <DrawPaths paths={dronepath.paths} color={color}/>
            <DrawBufferZones bufferZones={dronepath.bufferZones} color={color}/>
        </>
    )
}

/**
 * Converts a dronepath object to a JSON object.
 * @param {*} dronepath The dronepath to convert.
 * @returns A dronepath JSON object.
 */
function createPathJSON(dronepath) {
  return JSON.stringify(dronepath);
}

/**
 * Converts a dronepath JSON to a dronepath object.
 * @param {*} pathJSON The dronepath JSON to convert.
 * @returns A dronepath object.
 */
function createDronepathFromJSON(pathJSON) {
  const data = JSON.parse(pathJSON);

  const dronepath = new Dronepath(1);

  data.nodes.forEach(nodeData => {
    const position = L.latLng(nodeData.position.lat, nodeData.position.lng);
    const node = new Node(position);
    node.visible = nodeData.visible;
    dronepath.addNode(node);
  });

  return dronepath;
}