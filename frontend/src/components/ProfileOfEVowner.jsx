import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MapView from "./MapView";

export default function ProfileOfEVowner() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [location, setLocation] = useState(null);

  /* ================= FETCH BOOKING ================= */
  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/host/booking/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setBooking(data);
    };
    fetchBooking();
  }, [bookingId]);

  /* ================= FETCH LOCATION (REAL-TIME) ================= */
  useEffect(() => {
    const fetchLocation = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/api/EVowner/booking-location/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setLocation(data);
    };

    fetchLocation(); // initial fetch
    const interval = setInterval(fetchLocation, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, [bookingId]);

  /* ================= UPDATE BOOKING STATUS ================= */
  const updateStatus = async (action) => {
    const token = localStorage.getItem("token");
    let endpoint =
      action === "approved"
        ? "approve"
        : action === "charging"
        ? "start"
        : "complete";

    await fetch(`http://localhost:8000/api/host/${endpoint}/${bookingId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (action === "completed") {
      navigate("/host/dashboard");
    } else {
      setBooking({ ...booking, status: action });
    }
  };

  if (!booking || !booking.EVowner) {
    return <p>Loading EV Owner details...</p>;
  }

  /* ================= STATUS BADGE ================= */
  const statusMap = {
    approved: { text: "✔ Approved", style: styles.approved },
    charging: { text: "⚡ Charging Started", style: styles.charging },
    completed: { text: "🔋 Charging Completed", style: styles.completed },
    requested: { text: "⏳ Waiting for Host Approval", style: styles.pending },
  };

  const statusUI = statusMap[booking.status];

  /* ================= RETURN JSX ================= */
  return (
    <div style={styles.page}>
      {/* LEFT */}
      <div style={styles.left}>
        <h1 style={styles.heading}>EV Owner Profile</h1>

        <div style={styles.mapBox}>
          <h3>📍 EV Owner Location</h3>
          {location && (
            <MapView latitude={location.latitude} longitude={location.longitude} />
          )}
        </div>

        <div style={styles.locationBox}>
          <b>Location:</b> {location?.location || "Fetching..."}
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>

          <h2 style={styles.name}>{booking.EVowner.name}</h2>
          <p style={styles.email}>{booking.EVowner.email}</p>
          <p style={styles.phone}>{booking.EVowner.phone}</p>

          <div style={styles.chargerType}>
            ⚡ {booking.EVowner?.chargerType || "N/A"}
          </div>

          <div style={styles.statusBox}>
            <div style={{ ...styles.statusBadge, ...statusUI.style }}>
              {statusUI.text}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "15px" }}>
            {booking.status === "requested" && (
              <button style={styles.button} onClick={() => updateStatus("approved")}>
                Approve
              </button>
            )}
            {booking.status === "approved" && (
              <button style={styles.button} onClick={() => updateStatus("charging")}>
                Start Charging
              </button>
            )}
            {booking.status === "charging" && (
              <button style={styles.button} onClick={() => updateStatus("completed")}>
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    display: "flex",
    gap: "40px",
    padding: "30px",
    background: "#f4f6fb",
    minHeight: "100vh",
    fontFamily: "Arial",
  },

  heading: { marginBottom: "15px" },

  left: { flex: 1 },

  right: {
    marginTop: "80px",
    width: "380px",
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  mapBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    marginBottom: "15px",
  },

  locationBox: {
    background: "#fff",
    padding: "12px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
  },

  profileCard: {
    width: "280px",
    background: "#fff",
    padding: "22px 20px",
    borderRadius: "16px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
    textAlign: "center",
    marginTop: "60px",
  },

  avatar: {
    width: "78px",
    height: "78px",
    borderRadius: "50%",
    background: "#e3f2fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    margin: "0 auto 12px",
  },

  name: { fontSize: "22px", fontWeight: "700", marginBottom: "6px" },
  email: { fontSize: "15px", color: "#444", marginBottom: "4px" },
  phone: { fontSize: "15px", color: "#444", marginBottom: "10px" },

  chargerType: {
    display: "inline-block",
    padding: "6px 14px",
    background: "#eef2ff",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "16px",
  },

  statusBox: { marginTop: "6px" },
  statusBadge: {
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
  },

  approved: { background: "#e6f7ec", color: "#2e7d32" },
  charging: { background: "#e3f2fd", color: "#1565c0" },
  completed: { background: "#fff3e0", color: "#ef6c00" },
  pending: { background: "#f1f1f1", color: "#555" },

  button: {
    padding: "10px 20px",
    margin: "5px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#1565c0",
    color: "#fff",
    fontWeight: "600",
  },
};
