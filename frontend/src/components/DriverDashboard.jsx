import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const [hosts, setHosts] = useState([]);
  const [showHosts, setShowHosts] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (showHosts) fetchHosts();
  }, [showHosts]);

  const fetchHosts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/host", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (hostId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/driver/request",
        { hostId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("⚡ Charging request sent!");
    } catch (err) {
      alert("❌ Failed to send request");
    }
  };

  return (
    <div className="driver-dashboard">
      <h1>🚐 Driver Dashboard</h1>
      <p className="sub">Logged in as Driver</p>

      {!showHosts && (
        <button className="primary-btn" onClick={() => setShowHosts(true)}>
          View All Hosts
        </button>
      )}

      {showHosts && (
        <div className="host-grid">
          {hosts.map((host) => (
            <div className="host-card" key={host._id}>
              <div className="avatar">👤</div>
              <h3>{host.name}</h3>
              <p>{host.email}</p>
              <p className="location">
                📍 {host.location || "Not provided"}
              </p>

              <button
                className="request-btn"
                onClick={() => sendRequest(host._id)}
              >
                Send Charging Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
