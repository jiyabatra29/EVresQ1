import React, { useEffect, useState } from "react";
import "./HostDashboard.css";
import { useNavigate } from "react-router-dom";

export default function HostDashboard() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  // ✅ Accept request
  const handleAccept = async (req, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/host/accept/${req._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Accept failed");

      setSelectedRequest(req);

      // update UI
      setRequests((prev) =>
        prev.map((r) =>
          r._id === req._id ? { ...r, status: "approved" } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  // ✅ Fetch requests
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
        setRequests(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Status change handler
  const handleResponse = async (requestId, action) => {
    try {
      const token = localStorage.getItem("token");

      let endpoint = "";
      if (action === "approved") endpoint = "approve";
      if (action === "rejected") endpoint = "reject";
      if (action === "charging") endpoint = "start";
      if (action === "completed") endpoint = "complete";

      const res = await fetch(
        `http://localhost:8000/api/host/${endpoint}/${requestId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status: action } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating request");
    }
  };

  return (
    <div className="host-dashboard">
      <div className="host-header">
        <h1>🔌 Host Dashboard</h1>
        <p>
          Logged in as <b>Host</b>
        </p>
      </div>

      <h2 className="req-title">Incoming EV Requests</h2>

      <div className="req-grid">
        {requests.length === 0 ? (
          <p className="no-req">No requests yet</p>
        ) : (
          requests.map((req) => (
            <div
              className="req-card"
              key={req._id}
              onClick={() => navigate(`/host/evowner/${req._id}`)}
            >
              <div className="req-avatar">🚗</div>

              <div className="req-info">
                <h3>{req.EVowner?.name || "EV Owner"}</h3>
                <p>
                  <b>Email:</b> {req.EVowner?.email || "N/A"}
                </p>
                <p>
                  <b>Location:</b> {req.location || "N/A"}
                </p>
                <p>
                  <b>Status:</b> {req.status}
                </p>

                <div className="req-actions">
                  {req.status === "requested" && (
                    <>
                      <button
                        className="accept-btn"
                        onClick={(e) => handleAccept(req, e)}
                      >
                        Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResponse(req._id, "rejected");
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === "approved" && (
                    <button
                      className="start-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResponse(req._id, "charging");
                      }}
                    >
                      Start Charging
                    </button>
                  )}

                  {req.status === "charging" && (
                    <button
                      className="complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResponse(req._id, "completed");
                      }}
                    >
                      Complete Charging
                    </button>
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
