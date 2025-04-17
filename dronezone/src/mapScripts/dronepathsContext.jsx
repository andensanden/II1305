import React, { createContext, useState, useContext } from "react";

const DronepathsContext = createContext();

export function DronepathsProvider({ children }) {
  const [dronepaths, setDronepaths] = useState([]);

  const clearDronepaths = () => {
    setDronepaths([]);
  };

  const addDronepath = (newDronepath) => {
    setDronepaths(prevDronepaths => [...prevDronepaths, newDronepath]);
  };

  return (
    <DronepathsContext.Provider value={{ dronepaths, setDronepaths, addDronepath, clearDronepaths }}>
      {children}
    </DronepathsContext.Provider>
  );
}

export const useDronepaths = () => useContext(DronepathsContext);