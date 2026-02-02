import { useState, useEffect } from "react";
import type { Coordinates } from "@/api/types";

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [locationData, setLocationData] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  const getLocation = () => {
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocationData({
        coordinates: null,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable in your Locality.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out cause unavailable in your Locality .";
            break;
          default:
            errorMessage = "An unknown error occurred.";
        }

        setLocationData({
          coordinates: null,
          error: errorMessage,
          isLoading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Get location on component mount ONLY if we don't have it and it's not a fresh load blocking UX
  // Effectively, we want to AVOID requesting it immediately.
  // The best practice is to require user interaction.

  // However, often weather apps DO want to show local weather.
  // A compromise: check if we have a saved preference or if we are already permitted.
  // But standard practice: Don't call getLocation() in useEffect.

  // We will REMOVE the automatic call. The UI should show a "Locate Me" button if no location is set.
  // Get location on component mount if permission is ALREADY granted
  useEffect(() => {
    // Check if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // If granted, fetch immediately
          getLocation();
        } else {
          // If prompt or denied, setting loading to false so we don't show a skeleton indefinitely
          // The user will see the "Enable Location" button
          setLocationData((prev) => ({ ...prev, isLoading: false }));
        }
      });
    } else {
      // Fallback for browsers not supporting permissions API
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    ...locationData,
    getLocation, // Expose method to manually refresh location
  };
}
