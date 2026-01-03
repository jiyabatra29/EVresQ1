import React, { useEffect, useState } from "react";
import "./EVownerDashboard.css";

export default function EVownerDashboard() {
  const [hosts, setHosts] = useState([]);
  const [showHosts, setShowHosts] = useState(false);

  useEffect(() => {
    if (!showHosts) return;

    const fetchHosts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/host", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setHosts(data.users || data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHosts();
  }, [showHosts]);

  const handleRequestCharging = async (host) => {
    try {
      const token = localStorage.getItem("token");
      const evOwnerName = localStorage.getItem("name") || "EV Owner";
      const evOwnerEmail = localStorage.getItem("email") || "owner@example.com";

      const res = await fetch("http://localhost:8000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hostId: host._id,
          evOwnerName,
          evOwnerEmail,
          location: host.location || "Unknown",
        }),
      });

      if (!res.ok) throw new Error("Failed to send request");

      alert(`Charging request sent to ${host.name}`);
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div className="ev-dashboard">
      {/* DASHBOARD HEADER */}
      <div className="ev-main-header">
        <h1>⚡ EV Owner Dashboard</h1>
        <p className="ev-sub">
          Logged in as <b>EV Owner</b>
        </p>
      </div>

      {/* VIEW BUTTON */}
      {!showHosts && (
        <div className="view-hosts-wrapper">
          <button
            className="view-hosts-btn"
            onClick={() => setShowHosts(true)}
          >
            View All Hosts
          </button>
        </div>
      )}

      {/* HOST CARDS */}
      {showHosts && (
        <>
          <h2 className="hosts-title">Available Charging Hosts</h2>

          <div className="host-grid">
            {hosts.length === 0 ? (
              <p className="no-hosts">No hosts available</p>
            ) : (
              hosts.map((host) => (
                <div className="host-card big-card" key={host._id}>
                  <div className="host-avatar">🧑‍💼</div>

                  <div className="host-info">
                    <h3>{host.name || "Host Name"}</h3>
                    <p><b>Email:</b> {host.email}</p>
                    <p><b>Location:</b> {host.location || "Not provided"}</p>

                    <button
                      className="request-btn"
                      onClick={() => handleRequestCharging(host)}
                    >
                      Request Charging
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
