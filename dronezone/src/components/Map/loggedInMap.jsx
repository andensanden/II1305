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
import MapClick from "@/mapScripts/pathDrawing";
import LocationTracker from "@/mapScripts/locationTracker";
import { InFlightProvider } from "./inFlightContext"; // Adjust the path as necessary
import { DronepathHandler } from "@/mapScripts/dronepathHandler";

//--------------- UI Components -----------
import { HamburgerButton } from "./layerHamburgerMenu";
import GPSToggleControl from "@/mapScripts/gpsToggleControl";
import { DrawFlightPathMenu } from "./drawFlightPath";
import { YourDevicesMenu } from "./yourDevicesMenu";
import DashboardPanel from "../dashboard";
import { LaunchButton } from "./launchButton";

//-------- Main Map Component -------
const LoggedInMap = () => {
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [drawingMode, setDrawingMode] = useState(null);
  const position = [59.3293, 18.0686]; // Stockholm coordinates

  //-----------------
  //For launch functionality
  const [launch, setLaunch] = useState(false);

  //-----------------
  //For draw path menu
  const [flightPathMenuOpen, setFlightPathMenuOpen] = useState(false);
  const [confirmFlightPath, setConfirmFlightPath] = useState(false);
  const baseBottom = 80;
  const devicesButtonHeight = 60;
  const devicesPanelHeight = 260;
  //For your devices
  const [devicesMenuOpen, setDevicesMenuOpen] = useState(false);
  const [deviceStates, setDeviceStates] = useState([
    { name: "DJI AIR 3S – Photography...", checked: false },
    { name: "Tinyhawk III Plus – Racing", checked: true },
  ]);
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };
  //-----------------------

  const toggleTracking = () => {
    setTrackingEnabled((prev) => !prev);
  };

  //Displaying dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLaunchClick = () => {
    setShowDashboard((prevState) => !prevState);
    setLaunch((prevState) => !prevState);
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

        {/* Testing the Dashboard*/}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        ></div>
        <InFlightProvider>
          <LaunchButton onClick={handleLaunchClick} />
          {showDashboard && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
              }}
            >
              <DashboardPanel
                data={{
                  longitude: position[0],
                  latitude: position[1],
                  altitude: "N/A", // Replace when you have real data
                  timeElapsed: formatTime(elapsedSeconds),
                }}
              />
            </div>
          )}
        </InFlightProvider>

        {/* User tracking functionality*/}
        <LocationTracker trackingEnabled={trackingEnabled} />

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

        {(!flightPathMenuOpen || devicesMenuOpen) && (
          <YourDevicesMenu
            deviceStates={deviceStates}
            setDeviceStates={setDeviceStates}
            menuOpen={devicesMenuOpen}
            bottom={devicesMenuOpen ? 40 + 170 : 40}
            onToggleMenu={toggleDevicesMenu}
          />
        )}

        <ZonesProvider>
          {/* This is the overlay HAMBURGER button */}
          <HamburgerButton position={position} trackingEnabled={trackingEnabled} setTrackingEnabled={setTrackingEnabled} />
          <NodesProvider>
            {(!devicesMenuOpen || flightPathMenuOpen) && (
              <DrawFlightPathMenu
                flightPathMenuOpen={flightPathMenuOpen}
                onToggleMenu={toggleFlightPathMenu}
                confirmFlightPath={confirmFlightPath}
                setConfirmFlightPath={setConfirmFlightPath}
                setDrawingMode={setDrawingMode}
                bottom={flightPathMenuOpen ? 100 + 150 : 100}
              />
            )}
            <DronepathsProvider>
            <MapClick drawingMode={drawingMode} isLaunched={launch} />
            <DronepathHandler/>
            </DronepathsProvider>
            <ForbiddenZoneDrawing drawingMode={drawingMode} />
          </NodesProvider>
        </ZonesProvider>
      </MapContainer>
    </div>
  );
};

export default LoggedInMap;
