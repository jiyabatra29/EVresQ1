import React, { useEffect, useState } from "react";
import "./HostDashboard.css";

export default function HostDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:8000/api/host/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setRequests(data.requests || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();

    // Optional: poll every 5s to get new requests
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResponse = async (requestId, action) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!res.ok) throw new Error("Failed to update request");

      // update locally
      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status: action } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error updating request");
    }
  };

  return (
    <div className="host-dashboard">
      {/* HEADER */}
      <div className="host-header">
        <h1>🔌 Host Dashboard</h1>
        <p>Logged in as <b>Host</b></p>
      </div>

      {/* REQUESTS */}
      <h2 className="req-title">Incoming EV Requests</h2>

      <div className="req-grid">
        {requests.length === 0 ? (
          <p className="no-req">No requests yet</p>
        ) : (
          requests.map((req) => (
            <div className="req-card" key={req._id}>
              <div className="req-avatar">🚗</div>

              <div className="req-info">
                <h3>{req.evOwnerName}</h3>
                <p><b>Email:</b> {req.evOwnerEmail}</p>
                <p><b>Location:</b> {req.location}</p>
                <p><b>Status:</b> {req.status || "pending"}</p>

                <div className="req-actions">
                  {req.status === "pending" && (
                    <>
                      <button
                        className="accept-btn"
                        onClick={() => handleResponse(req._id, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleResponse(req._id, "rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
