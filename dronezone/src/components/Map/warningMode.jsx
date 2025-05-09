import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch
import { useFlightMode } from "./inFlightContext"; // adjust path if needed
import { toggleTakeDownDrone } from "@/Redux/event/eventSlice";
import { supabase } from "@/supabase/config";

export function WarningMode() {
  const [warningActive, setWarningActive] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Use useSelector at the top level of the component
  const { isAuth, email, userID, phone } = useSelector((state) => state.auth);
  const takeDownDrone = useSelector((state) => state.event.takeDownDrone);
  const dispatch = useDispatch();
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // Function to get user information when warned
  function getWarnedUser() {
    if (isAuth) {
      setUserInfo({ email, userID, phone });
    }
  }

  // Function to send a new alert to the database
  async function addAlert() {
    const { data } = await supabase.auth.getUser();

    await fetch(`${backendURL}/api/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: data.user.id,
        alertContent: "You have been warned bitch, last chance - we will call you on this number: "
      }),
    });
  }

  return (
    <>
      {/* Toggle Button for Testing */}
      <button
        onClick={() => {
          getWarnedUser(); // Corrected function name
          setWarningActive((prev) => !prev);
          addAlert();
          dispatch(toggleTakeDownDrone());
        }}
        className="absolute bottom-0 left-[20px] z-999 cursor-pointer text-xl"
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
            <h2 className="text-xl font-bold mb-[10px]">WARNING</h2>
            <p className="text-sm w-[300px]">
              Bring your drone down immediately. This airspace is currently in use and must be cleared. Failure to comply may result in enforcement action.
              {userInfo && (
                <>
                  <p>User: {userInfo.userID}</p>
                  <p>Phone Number: {userInfo.phone}</p>
                  <p>email: {userInfo.email}</p>
                </>
              )}
            </p>
          </div>
        </>
      )}
    </>
  );
}