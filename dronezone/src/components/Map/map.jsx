import { useState, useEffect } from "react";

//--------- LEAFLET------------

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

//------------ UTILS ------
import DrawingModeControl from "@/mapScripts/drawingModeControl";
import ForbiddenZoneDrawing from "@/mapScripts/forbiddenZoneDrawing";
import { ZonesProvider } from "@/mapScripts/ZonesContext.jsx";
import { NodesProvider } from "@/mapScripts/nodesContext";
import { DronepathsProvider } from "@/mapScripts/dronepathsContext";
//import MapClick from '@/mapScripts/pathDrawing';
import LocationTracker from "@/mapScripts/locationTracker";
import { DronepathHandler } from "@/mapScripts/dronepathHandler";


//--------------- UI Components -----------
import { HamburgerButton } from "./layerHamburgerMenu";
import GPSToggleControl from "@/mapScripts/gpsToggleControl";



/**MARKER ON MAP DEPLOYED VERSION*/

import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

//-------- Main Map Component -------
const Map = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState("path");
  const position = [59.3293, 18.0686]; // Stockholm coordinates


  const toggleTracking = () => {
    setTrackingEnabled((prev) => !prev);
  };

  return (
    //Overall map component generation with styling
    <div style={{ position: "relative", height: "82vh", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Initializing the leaflet-map*/}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Activation of GPS functionality */}
        <GPSToggleControl
          trackingEnabled={trackingEnabled}
          toggleTracking={toggleTracking}
        />

        {/* User tracking functionality*/}
        <LocationTracker trackingEnabled={trackingEnabled} />

        <NodesProvider>
        <ZonesProvider>
          {/* This is the overlay HAMBURGER button */}
          <HamburgerButton position={position} trackingEnabled={trackingEnabled} setTrackingEnabled={setTrackingEnabled} />
          {/*<MapClick drawingMode={drawingMode} />*/}
          <ForbiddenZoneDrawing drawingMode={drawingMode} />
        </ZonesProvider>
        </NodesProvider>
        <DronepathsProvider>
          <DronepathHandler/>
        </DronepathsProvider>
      </MapContainer>
    </div>
  );
};

export default Map;
