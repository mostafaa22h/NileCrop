import { useCallback, useState } from "react";
import { egyptianCities } from "@data/egyptianCities";

function calculateDistance(lat1, lng1, lat2, lng2) {
  return Math.hypot(lat1 - lat2, lng1 - lng2);
}

function findNearestCity(latitude, longitude) {
  return egyptianCities.reduce((closest, city) => {
    const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
    if (!closest || distance < closest.distance) return { city, distance };
    return closest;
  }, null)?.city;
}

export default function useGeolocation() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const detectCity = useCallback(() => {
    setError("");
    setStatus("loading");

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message = "Geolocation is not supported in this browser.";
        setStatus("error");
        setError(message);
        reject(new Error(message));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const city = findNearestCity(coords.latitude, coords.longitude);
          if (!city) {
            const message = "Unable to match a nearby Egyptian city.";
            setStatus("error");
            setError(message);
            reject(new Error(message));
            return;
          }

          setStatus("success");
          resolve(city);
        },
        (geoError) => {
          setStatus("error");
          setError(geoError.message);
          reject(geoError);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }, []);

  return { detectCity, status, error };
}
