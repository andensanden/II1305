import { useState, useEffect, useRef } from "react";

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
import { ZonesProvider } from "@/mapScripts/zonesContext";
import MapClick from "@/mapScripts/pathDrawing";
import LocationTracker from "@/mapScripts/locationTracker";
import { InFlightProvider, useFlightMode } from "./inFlightContext";
import { EndFlight } from "@/mapScripts/dronepathHandler.js";
import { useNodes } from "@/mapScripts/nodesContext";

//--------------- UI Components -----------
import { HamburgerButton } from "./layerHamburgerMenu";
import GPSToggleControl from "@/mapScripts/gpsToggleControl";
import { DrawFlightPathMenu } from "./drawFlightPath";
import { YourDevicesMenu } from "./yourDevicesMenu";
import DashboardPanel from "./dashboard";
import { LaunchButton } from "./launchButton";
import { PopUpDrone } from "./popUpDrone";
import { WarningMode } from "./warningMode";
import  SmallDashboard  from "./smallDashboard";

//import { getAllActiveDrones } from "../ActiveDrones/activeDronesDisplayer";
import { ActiveDronesDisplayer } from "../ActiveDrones/activeDronesDisplayer";
//-------- Main Map Component -------
const LoggedInMap = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null);
  const position = [59.3293, 18.0686]; // Stockholm coordinates

  //-----------------
  //For launch functionality
  const [launch, setLaunch] = useState(false);

  const [showActiveDrones, setShowActiveDrones] = useState(true);
  const drones = ActiveDronesDisplayer();
  const { clearNodes } = useNodes();
  const { flightMode } = useFlightMode();
  const flightModeRef = useRef(flightMode);
  const hasCheckedIfInFlight = useRef(false);

  //-----------------
  //For draw path menu
  const [flightPathMenuOpen, setFlightPathMenuOpen] = useState(false);
  const [confirmFlightPath, setConfirmFlightPath] = useState(false);
  const baseBottom = 80;
  const devicesButtonHeight = 60;
  const devicesPanelHeight = 260;
  //For your devices
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  /*const [deviceStates, setDeviceStates] = useState([
    { name: "DJI AIR 3S – Photography...", checked: false },
    { name: "Tinyhawk III Plus – Racing", checked: true },
  ]);*/
  const drawFlightBottom =
    baseBottom +
    (devicesMenuOpen ? devicesPanelHeight : devicesButtonHeight) +
    10;
  const devicesBottom = baseBottom;

  //For both menus to work dynamically
  const toggleFlightPathMenu = () => {
    setFlightPathMenuOpen((prev) => {
      if (!prev) {
        setDevicesMenuOpen(false);
      }
      return !prev;
    });
  };

  const toggleDevicesMenu = () => {
    setDevicesMenuOpen((prev) => {
      if (!prev) {
        setFlightPathMenuOpen(false);
      }
      return !prev;
    });
  };
  // For timer in dashpanel
  const [resetTimerCounter, setResetTimerCounter] = useState(0);

  //-----------------------

  const toggleTracking = () => {
    setTrackingEnabled((prev) => !prev);
  };

  //Displaying dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLaunchClick = () => {
    setLaunch(!launch);
  };

  const handleEndFlightClick = () => {
    setShowDashboard(false);
    setLaunch(false);
    setResetTimerCounter(prev => prev + 1); // trigger reset
    EndFlight();
    clearNodes();
  };

  useEffect(() => {
    flightModeRef.current = flightMode;
    setShowDashboard(flightModeRef.current === "inFlightMode" ? true : false);
  }, [flightMode]);

  return (
    //Overall map component generation with styling
    <div style={{ position: "relative", height: "82vh", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={13}
        minZoom={5}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Initializing the leaflet-map*/}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Recenter to current position */}
        <GPSToggleControl/>

        {/* Testing the Dashboard*/}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        ></div>
          <LaunchButton onLaunchClick={handleLaunchClick} onEndClick={handleEndFlightClick} />
          {showDashboard && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
              }}
            >
              <SmallDashboard />
              <DashboardPanel
                launchActive={showDashboard}
                resetKey={resetTimerCounter}
                data={{
                  longitude: position[0],
                  latitude: position[1],
                  altitude: "N/A",
                }}
              />
            </div>
          )}

        {showActiveDrones && <PopUpDrone hasCheckedIfInFlight={hasCheckedIfInFlight}/>}

        {/* User tracking functionality*/}
        {!showDashboard && (
          <LocationTracker trackingEnabled={trackingEnabled} />
        )}

        {/* draw flight path Menu*/}
        {/*} {(!devicesMenuOpen || flightPathMenuOpen) && (
          <DrawFlightPathMenu
            flightPathMenuOpen={flightPathMenuOpen}
            onToggleMenu={toggleFlightPathMenu}
            confirmFlightPath={confirmFlightPath}
            setConfirmFlightPath={setConfirmFlightPath}
            setDrawingMode={setDrawingMode}
            bottom={flightPathMenuOpen ? 100 + 150 : 100}
          />
        )} */}

        {(flightMode === "drawFlightMode") && (!flightPathMenuOpen || devicesMenuOpen) && (
          <YourDevicesMenu
            menuOpen={devicesMenuOpen}
            bottom={devicesMenuOpen ? 21 + 170 : 21}
            onToggleMenu={toggleDevicesMenu}
          />
        )}
       
        <ZonesProvider>
          {/* This is the overlay HAMBURGER button */}
          <HamburgerButton position={position} trackingEnabled={trackingEnabled} setTrackingEnabled={setTrackingEnabled} showActiveDrones={showActiveDrones}
                          setShowActiveDrones={setShowActiveDrones} />
            {(flightMode === "drawFlightMode") && (!devicesMenuOpen || flightPathMenuOpen) && (
              <DrawFlightPathMenu
                flightPathMenuOpen={flightPathMenuOpen}
                onToggleMenu={toggleFlightPathMenu}
                setFlightPathMenuOpen={setFlightPathMenuOpen}
                setDevicesMenuOpen={setDevicesMenuOpen}
                confirmFlightPath={confirmFlightPath}
                setConfirmFlightPath={setConfirmFlightPath}
                setDrawingMode={setDrawingMode}
                bottom={flightPathMenuOpen ? 80 + 150 : 80}
                showDashboard={showDashboard} 
              />
            )}
            <MapClick drawingMode={drawingMode} isLaunched={launch} />
            <ForbiddenZoneDrawing drawingMode={drawingMode} />
        </ZonesProvider>

        
      </MapContainer>
      <WarningMode  />
    </div>
  );
};

export default LoggedInMap;
