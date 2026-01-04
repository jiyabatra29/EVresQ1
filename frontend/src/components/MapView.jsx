import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const zoomedRef = useRef(false);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([51.505, -0.09], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(mapRef.current);
    }

    // Geolocation logic (SAME as your HTML)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // remove old marker & circle
        if (markerRef.current) {
          mapRef.current.removeLayer(markerRef.current);
          mapRef.current.removeLayer(circleRef.current);
        }

        markerRef.current = L.marker([latitude, longitude]).addTo(
          mapRef.current
        );

        circleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
        }).addTo(mapRef.current);

        if (!zoomedRef.current) {
          mapRef.current.fitBounds(circleRef.current.getBounds());
          zoomedRef.current = true;
        }

        mapRef.current.setView([latitude, longitude]);
      },
      (err) => {
        if (err.code === 1) {
          alert("Please allow location access");
        } else {
          alert("Unable to get location");
        }
      }
    );

    // cleanup on unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Welcome to the Sample Page</h1>
      <p>This is a simple React Leaflet page.</p>

      {/* REQUIRED MAP CONTAINER */}
      <div id="map" style={styles.map}></div>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    margin: "20px",
    backgroundColor: "#f8f9fa",
    color: "#343a40",
  },
  heading: {
    color: "#007bff",
  },
  map: {
    height: "500px",
    border: "5px solid #007bff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
};

export default MapView;