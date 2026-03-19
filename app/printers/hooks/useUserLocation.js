import { useState, useEffect } from "react";

export const useUserLocation = () => {
  console.log("💻 useUserLocation /app/printers/hooks/useUserLocation.js");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {},
        );
      }
    };

    getUserLocation();
  }, []);

  return { userLocation };
};
