/**
 * ZonesContext.jsx
 *
 * This module provides a React Context for managing forbidden zones on the map.
 *
 * It allows any component in the app to:
 *   - Access the current list of zones
 *   - Add a new zone (e.g. after drawing on the map)
 *   - Update an existing zone (e.g. after editing coordinates)
 *   - Replace the entire list if needed (via setZones)
 *
 * Main Components:
 * ----------------
 * - ZonesProvider: Wrap your application (or parts of it) in this to enable zone sharing.
 * - useZones: Custom React hook that gives access to the zone state and actions.
 *
 * Example use case:
 * -----------------
 * - A user draws a polygon on the map → call `addZone(...)`
 * - A zone is moved or edited → call `updateZone(index, newZone)`
 * - Any component can read the list of all current zones using `zones`
 *
 * This pattern ensures clean, centralized state management for forbidden zones
 * and avoids prop drilling across deeply nested components.
 */

import React, { createContext, useState, useContext } from 'react';

// Create a context for zones
const ZonesContext = createContext();

// Create a provider component
export const ZonesProvider = ({ children }) => {
  const [zones, setZones] = useState([]);
  const [showRestrictedZones, setShowRestrictedZones] = useState(true);

  // Update zone at a specific index
  const updateZone = (index, newZone) => {
    setZones((prevZones) => {
      const updatedZones = [...prevZones];
      updatedZones[index] = newZone;
      return updatedZones;
    });
  };

  // Add a new zone
  // Remove?
  const addZone = (newZone) => {
    setZones((prevZones) => [...prevZones, newZone]);
  };

  // Toggles visibility of forbidden zones
  const toggleZones = () => {
    setShowRestrictedZones(!showRestrictedZones);
  };

  return (
    <ZonesContext.Provider value={{ zones, setZones, updateZone, showRestrictedZones, toggleZones }}>
      {children}
    </ZonesContext.Provider>
  );
};

// Custom hook to use the ZonesContext
export const useZones = () => useContext(ZonesContext);