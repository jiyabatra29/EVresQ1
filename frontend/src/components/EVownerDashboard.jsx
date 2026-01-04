import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EVownerDashboard.css";

export default function EVownerDashboard() {
  const [hosts, setHosts] = useState([]);
  const [showHosts, setShowHosts] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!showHosts) return;

    const fetchHostsAndStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/EVowner/hosts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const hostsData = await res.json();
        setHosts(hostsData);

        const statusMap = {};

        for (let host of hostsData) {
          const r = await fetch(
            `http://localhost:8000/api/EVowner/my-booking/${host._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const booking = await r.json();
          if (booking) statusMap[host._id] = booking.status;
        }

        setBookingStatus(statusMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHostsAndStatus();
    const interval = setInterval(fetchHostsAndStatus, 5000);
    return () => clearInterval(interval);
  }, [showHosts]);

  // 🔹 ONLY CHANGE IS INSIDE THIS FUNCTION
  const handleRequestCharging = (host) => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = localStorage.getItem("token");

          const res = await fetch(
            "http://localhost:8000/api/EVowner/book-home-charger",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                hostId: host._id,
                chargerType: "fast",
                timeSlot: "2024-07-01T10:00:00Z",
                status: "requested",

                // ⚠️ user se nahi, browser se auto
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            }
          );

          const data = await res.json();
          console.log("STATUS:", res.status);
          console.log("RESPONSE:", data);

          if (!res.ok) throw new Error("Request failed");

          setBookingStatus((prev) => ({
            ...prev,
            [host._id]: "requested",
          }));

          alert(`Charging request sent to ${host.name}`);
        } catch (err) {
          console.error(err);
          alert("Error sending request");
        }
      },
      () => {
        alert("Please allow location access");
      }
    );
  };

  return (
    <div className="ev-dashboard">
      <div className="ev-main-header">
        <h1>⚡ EV Owner Dashboard</h1>
        <p className="ev-sub">
          Logged in as <b>EV Owner</b>
        </p>
      </div>

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

      {showHosts && (
        <>
          <h2 className="hosts-title">Available Charging Hosts</h2>

          <div className="host-grid">
            {hosts.length === 0 ? (
              <p className="no-hosts">No hosts available</p>
            ) : (
              hosts.map((host) => {
                const status = bookingStatus[host._id];

                return (
                  <div
                    className="host-card big-card"
                    key={host._id}
                    onClick={() => navigate(`/ev/host/${host._id}`)}
                  >
                    <div className="host-avatar">🧑‍💼</div>

                    <div className="host-info">
                      <h3>{host.name || "Host Name"}</h3>
                      <p><b>Email:</b> {host.email}</p>
                      <p><b>Location:</b> {host.location || "Not provided"}</p>

                      <button
                        className="request-btn"
                        disabled={status && status !== "rejected"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestCharging(host);
                        }}
                      >
                        {!status && "Request Charging"}
                        {status === "requested" && "Requested"}
                        {status === "approved" && "Approved"}
                        {status === "charging" && "Charging..."}
                        {status === "completed" && "Charging Completed"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
