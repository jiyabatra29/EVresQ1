import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MapView3 from "./MapView";

export default function Profileofevownerfordriver() {
  const { evOwnerId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [owner, setOwner] = useState(null);
  const [status, setStatus] = useState(state?.status);
  const bookingId = state?.bookingId;

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/driver/evowner/${evOwnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOwner(res.data))
      .catch(console.error);
  }, [evOwnerId, token]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/driver/requests",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequests(res.data);
  };

  const booking = requests.find(
    (r) => r.EVowner?._id === evOwnerId
  );

  const updateStatus = async (endpoint) => {
    await axios.patch(
      `http://localhost:8000/api/driver/${endpoint}/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newStatus =
      endpoint === "accept"
        ? "accepted"
        : endpoint === "start"
        ? "on_the_way"
        : endpoint === "complete"
        ? "completed"
        : "rejected";

    setStatus(newStatus);

    if (newStatus === "completed") {
      await axios.delete(
        `http://localhost:8000/api/driver/delete-booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeout(() => navigate("/driver/dashboard"), 1200);
    }
  };

  if (!owner) return <p>Loading EV Owner...</p>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>⚡ EV Owner Profile</h1>

      <div style={styles.container}>
        {/* MAP */}
        <div style={styles.mapSection}>
          <div style={styles.mapBox}>
            <h3 style={{ marginBottom: 10 }}>📍 EV Owner Location</h3>

            <div style={styles.mapWrapper}>
              {booking?.pickupLocation && (
                <MapView3
                  latitude={booking.pickupLocation.latitude}
                  longitude={booking.pickupLocation.longitude}
                />
              )}
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div style={styles.profileSection}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>👤</div>

            <h2 style={styles.name}>{owner.name}</h2>
            <p style={styles.email}>{owner.email}</p>
            <p style={styles.phone}>{owner.phone}</p>

            <div style={{ ...styles.statusBadge, ...statusStyles[status] }}>
              {statusLabels[status]}
            </div>

            <div style={{ marginTop: 16 }}>
              {status === "requested" && (
                <>
                  <button
                    style={styles.button}
                    onClick={() => updateStatus("accept")}
                  >
                    Accept
                  </button>
                  <button
                    style={{ ...styles.button, background: "#c62828" }}
                    onClick={() => updateStatus("reject")}
                  >
                    Reject
                  </button>
                </>
              )}

              {status === "accepted" && (
                <button
                  style={styles.button}
                  onClick={() => updateStatus("start")}
                >
                  On The Way
                </button>
              )}

              {status === "on_the_way" && (
                <button
                  style={styles.button}
                  onClick={() => updateStatus("complete")}
                >
                  Completed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== STYLES (REFERENCE MATCH) ================== */

const styles = {
  page: {
    background: "#f4f6fb",
    minHeight: "100vh",
    padding: "30px",
    fontFamily: "Arial",
  },

  heading: {
    marginBottom: "22px",
  },

  container: {
     width: "100%",
  display: "flex",
  alignItems: "flex-start",
  gap: "28px",
  },

  mapSection: {
    flex: 1,
  },

  mapBox: {
    background: "#fff",
    padding: "14px",
    borderRadius: "16px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },

  mapWrapper: {
    height: "320px",           // ✅ SAME as reference
    maxWidth: "100%",          // ❌ no stretch
    borderRadius: "14px",
    overflow: "hidden",
  },

  profileSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    marginTop: "55px",
  },

  profileCard: {
    width: "280px",
    background: "#fff",
    padding: "22px",
    borderRadius: "20px",
    boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
    textAlign: "center",
  },

  avatar: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "0 auto 12px",
  },

  name: { fontSize: "21px", fontWeight: "700" },
  email: { fontSize: "14px", color: "#555" },
  phone: { fontSize: "14px", color: "#555", marginBottom: "12px" },

  statusBadge: {
    padding: "9px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "10px",
  },

  button: {
    padding: "10px 18px",
    margin: "6px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#1565c0",
    color: "#fff",
    fontWeight: "600",
  },
};

const statusLabels = {
  requested: "⏳ Request Pending",
  accepted: "✔ Accepted",
  on_the_way: "🚗 On The Way",
  completed: "🔋 Completed",
};

const statusStyles = {
  requested: { background: "#f1f1f1", color: "#555" },
  accepted: { background: "#e6f7ec", color: "#2e7d32" },
  on_the_way: { background: "#e3f2fd", color: "#1565c0" },
  completed: { background: "#fff3e0", color: "#ef6c00" },
};
