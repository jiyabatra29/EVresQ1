import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MapView2 from "./MapView2";

export default function ProfileOfHost() {
  const { hostId } = useParams();
  const [host, setHost] = useState(null);
  const [bookingStatus, setBookingStatus] = useState("pending");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchHost = async () => {
      const res = await fetch(
        `http://localhost:8000/api/EVowner/${hostId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setHost(data);
    };

    fetchHost();
  }, [hostId]);

  if (!host) return <p>Loading...</p>;

  const statusMap = {
    approved: { text: "✔ Approved", style: styles.approved },
    charging: { text: "⚡ Charging Started", style: styles.charging },
    completed: { text: "🔋 Charging Completed", style: styles.completed },
    pending: { text: "⏳ Waiting for Host Approval", style: styles.pending }
  };

  const statusUI = statusMap[bookingStatus];

  return (
    <div style={styles.page}>
      {/* LEFT */}
      <div style={styles.left}>
        <h1 style={styles.heading}>Host Profile</h1>

        <div style={styles.mapBox}>
          <h3>📍 Host Location</h3>
          <MapView2 latitude={host.latitude} longitude={host.longitude} />
        </div>

        <div style={styles.locationBox}>
          <b>Host Location:</b> {host.location}
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>

          <h2 style={styles.name}>{host.name}</h2>

          <p style={styles.email}>{host.email}</p>
          <p style={styles.phone}>{host.phone}</p>

          <div style={styles.chargerType}>
            ⚡ {host.chargerType}
          </div>

          <div style={styles.statusBox}>
            <div style={{ ...styles.statusBadge, ...statusUI.style }}>
              {statusUI.text}
            </div>
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
    fontFamily: "Arial"
  },

  heading: { marginBottom: "15px" },

  left: { flex: 1 },

  right: {
    marginTop:"80px",
    width: "380px",
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start"
  },

  mapBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    marginBottom: "15px"
  },

  locationBox: {
    background: "#fff",
    padding: "12px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)"
  },

  /* ===== PROFILE CARD ===== */

  profileCard: {
    width: "280px",
    background: "#fff",
    padding: "22px 20px",
    borderRadius: "16px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
    textAlign: "center",

    /* ✅ ONLY CHANGE */
    marginTop: "60px"
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
    margin: "0 auto 12px"
  },

  name: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "6px"
  },

  email: {
    fontSize: "15px",
    color: "#444",
    marginBottom: "4px"
  },

  phone: {
    fontSize: "15px",
    color: "#444",
    marginBottom: "10px"
  },

  chargerType: {
    display: "inline-block",
    padding: "6px 14px",
    background: "#eef2ff",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "16px"
  },

  statusBox: { marginTop: "6px" },

  statusBadge: {
    padding: "10px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px"
  },

  approved: { background: "#e6f7ec", color: "#2e7d32" },
  charging: { background: "#e3f2fd", color: "#1565c0" },
  completed: { background: "#fff3e0", color: "#ef6c00" },
  pending: { background: "#f1f1f1", color: "#555" }
};
