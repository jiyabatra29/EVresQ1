import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MapView from "./MapView";

export default function ProfileOfEVowner() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

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

  const updateStatus = async (action) => {
    const token = localStorage.getItem("token");
    let endpoint = action === "approved" ? "approve"
                 : action === "charging" ? "start"
                 : "complete";

    await fetch(
      `http://localhost:8000/api/host/${endpoint}/${bookingId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (action === "completed") {
      navigate("/host/dashboard");
    } else {
      setBooking({ ...booking, status: action });
    }
  };

  if (!booking || !booking.EVowner) {
  return <p>Loading EV Owner details...</p>;
}

return (
  <div>
    <h1>EV Owner Profile</h1>

    <p><b>Name:</b> {booking.EVowner?.name}</p>
    <p><b>Email:</b> {booking.EVowner?.email}</p>
    <p><b>Phone:</b> {booking.EVowner?.phone}</p>

    <p><b>Status:</b> {booking.status}</p>
    {booking.status === "requested" && (
        <button onClick={() => updateStatus("approved")}>Approve</button>
      )}
      {booking.status === "approved" && (
        <button onClick={() => updateStatus("charging")}>Start Charging</button>
      )}
      {booking.status === "charging" && (
        <button onClick={() => updateStatus("completed")}>Complete</button>
      )}
      {booking?.latitude && booking?.longitude && (
  <div style={{
    marginTop: "20px",
    border: "2px solid #ddd",
    borderRadius: "10px",
    padding: "10px"
  }}>
    <h3>📍 EV Owner Location</h3>

    <MapView
      lat={booking.latitude}
      lng={booking.longitude}
    />
  </div>
)}

  </div>
);
}
