import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MapView from "./MapView";


export default function ProfileOfHost() {
  const { hostId } = useParams();
  const [host, setHost] = useState(null);

  useEffect(() => {
    const fetchHost = async () => {
      const token = localStorage.getItem("token");
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

 return (
  <div>
    <h1>Host Profile</h1>

    <p><b>Name:</b> {host.name}</p>
    <p><b>Email:</b> {host.email}</p>
    <p><b>Location:</b> {host.location}</p>
    <p><b>Charger Type:</b> {host.chargerType}</p>

    {/* ✅ MAP BOX */}
    {host?.latitude && host?.longitude && (
      <div style={{
        marginTop: "20px",
        border: "2px solid #ddd",
        borderRadius: "10px",
        padding: "10px"
      }}>
        <h3>📍 Host Location</h3>
        <MapView lat={host.latitude} lng={host.longitude} />
      </div>
    )}
  </div>
);

}
