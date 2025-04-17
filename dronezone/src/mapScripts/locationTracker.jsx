import { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Method for tracking user's location.
 * @param {boolean} trackingEnabled - whether to track user's location 
 * @returns {JSX.Element} - Return a marker at given position
 * 
 */
function LocationTracker({ trackingEnabled }) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  //const [accuracy, setAccuracy] = useState(null); REMOVE ALL MENTIONS OF ACCURACY IF NOT DESIRED
  const [watchId, setWatchId] = useState(null);
  const [mapCentered, setMapCentered] = useState(false);

  useEffect(() => {
    // Start or stop tracking based on the trackingEnabled prop
    if (trackingEnabled) {
      if (!navigator.geolocation) {
        console.log("Your browser does not support geolocation!");
        return;
      }
      // Get Position and update it
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          //setAccuracy(pos.coords.accuracy);
          // Center map if it has not already been centered
          if (!mapCentered) {
            map.flyTo(newPos, map.getZoom());
            setMapCentered(true);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000
        }
      );

      setWatchId(id);

      return () => {
        if (id) {
          navigator.geolocation.clearWatch(id);
        }
      };
    } else if (watchId) {
      // Clear the watch when tracking is disabled
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setMapCentered(false);
      // We don't clear position to keep the last known location visible
    }
  }, [trackingEnabled, map, mapCentered]);

  return (
    <>
      {trackingEnabled && position && (
        <>
          <Marker position={position} />
          {/*accuracy && (
                      <Circle
                        center={position}
                        radius={accuracy}
                        color="blue"
                        fillColor="blue"
                        fillOpacity={0.2}
                      />
                    )*/}
        </>
      )}
    </>
  );
}

export default LocationTracker;