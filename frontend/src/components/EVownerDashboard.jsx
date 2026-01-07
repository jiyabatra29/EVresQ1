import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EVownerDashboard.css";

export default function EVownerDashboard() {
  const [hosts, setHosts] = useState([]);
  const [showHosts, setShowHosts] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({});
  const [driverBooking, setDriverBooking] = useState(null);
  const [redirected, setRedirected] = useState(false);

  const navigate = useNavigate();

  /* ================= FETCH HOSTS + BOOKING STATUS ================= */
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
          if (booking) {
            statusMap[host._id] = {
              bookingId: booking._id,
              status: booking.status,
            };
          }
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

  /* ================= REQUEST CHARGING ================= */
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
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            }
          );

          const data = await res.json();
          if (!res.ok) throw new Error("Request failed");

          setBookingStatus((prev) => ({
            ...prev,
            [host._id]: {
              bookingId: data.booking._id,
              status: "requested",
            },
          }));

          alert(`Charging request sent to ${host.name}`);
        } catch (err) {
          console.error(err);
          alert("Error sending request");
        }
      },
      () => alert("Please allow location access")
    );
  };

  /* ================= UPDATE LOCATION (CHARGING) ================= */
  useEffect(() => {
    if (!bookingStatus) return;

    const activeBooking = Object.values(bookingStatus).find(
      (b) => b.status !== "completed"
    );

    if (!activeBooking) return;

    const bookingId = activeBooking.bookingId;
    const token = localStorage.getItem("token");

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await fetch(
            `http://localhost:8000/api/EVowner/update-location/${bookingId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            }
          );
        } catch (err) {
          console.error(err);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingStatus]);

  /* ================= DRIVER BOOKING ================= */
  useEffect(() => {
    if (redirected) return;

    const fetchDriverStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:8000/api/EVowner/my-driver-request",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (data?.driver) setDriverBooking(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDriverStatus();
    const interval = setInterval(fetchDriverStatus, 5000);
    return () => clearInterval(interval);
  }, [redirected]);

  useEffect(() => {
    if (driverBooking?.driver) {
      setRedirected(true);
      navigate(`/ev/driver/${driverBooking.driver._id}`, {
        state: driverBooking,
        replace: true,
      });
    }
  }, [driverBooking, navigate]);

  /* ================= UI ================= */
  return (
    <div className="ev-dashboard">
      <div className="ev-main-header">
        <h1>⚡ EV Owner Dashboard</h1>
        <p className="ev-sub">
          Logged in as <b>EV Owner</b>
        </p>
      </div>

      {/* ===== DASHBOARD ACTIONS ===== */}
      {!showHosts && (
        <div
          className="view-hosts-wrapper"
          style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        >
          <button
            className="view-hosts-btn"
            onClick={() => setShowHosts(true)}
          >
            View All Hosts
          </button>

          <button
            className="view-hosts-btn"
            onClick={() => {
              const token = localStorage.getItem("token");

              navigator.geolocation.getCurrentPosition(async (pos) => {
                await fetch(
                  "http://localhost:8000/api/EVowner/request-driver",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                      address: "Current Location",
                      note: "Need charging assistance",
                    }),
                  }
                );
                alert("🚗 Driver request sent");
              });
            }}
          >
            🚗 Book Driver
          </button>
        </div>
      )}

      {/* ===== HOST LIST ===== */}
      {showHosts && (
        <>
          <h2 className="hosts-title">Available Charging Hosts</h2>

          <div className="host-grid">
            {hosts.length === 0 ? (
              <p className="no-hosts">No hosts available</p>
            ) : (
              hosts.map((host) => {
                const booking = bookingStatus[host._id];
                const status = booking?.status;

                const disableRequest =
                  status === "requested" ||
                  status === "approved" ||
                  status === "charging";

                return (
                  <div key={host._id} className="host-card big-card">
                    <div className="host-avatar">🧑‍💼</div>

                    <div className="host-info">
                      <h3>{host.name || "Host Name"}</h3>
                      <p><b>Email:</b> {host.email}</p>
                      <p><b>Location:</b> {host.location || "Not provided"}</p>

                      <button
                        className="request-btn"
                        disabled={disableRequest}
                        onClick={() => handleRequestCharging(host)}
                      >
                        {!status && "Request Charging"}
                        {status === "requested" && "Requested"}
                        {status === "approved" && "Approved"}
                        {status === "charging" && "Charging..."}
                        {status === "completed" && "Request Again"}
                      </button>

                      <br />

                      <button
                        className="request-btn"
                        onClick={() => navigate(`/ev/host/${host._id}`)}
                      >
                        View Profile
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
