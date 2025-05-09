import React, { useState } from "react";
import { useFlightMode } from "./inFlightContext"; // adjust path if needed
import { useSelector } from "react-redux";
import { toggleTakeDownDrone } from "@/Redux/event/eventSlice";
import { useDispatch } from "react-redux";

export function WarningMode() {

  const takeDownDrone = useSelector((state) => state.event.takeDownDrone);
  const dispatch = useDispatch();

  return (
    <>
      {/* Toggle Button for Testing */}
      <button
        onClick={() => dispatch(toggleTakeDownDrone())}
        className="absolute -bottom-1 left-[20px] z-999 cursor-pointer text-xl"
      >
        ⚠️
      </button>

      {takeDownDrone && (
        <>
          {/* Red overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              backgroundColor: "rgba(255, 0, 0, 0.5)",
              zIndex: 1050,
              pointerEvents: "none",
            }}
          />

          {/* Centered warning message */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1060,
              backgroundColor: "white",
              padding: "20px 30px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <h2 className=" text-xl font-bold mb-[10px]">WARNING</h2>
            <p className=" text-sm w-[300px]">
              Bring your drone down immediately. This airspace is currently in
              use and must be cleared. Failure to comply may result in
              enforcement action.
            </p>
          </div>
        </>
      )}
    </>
  );
}
