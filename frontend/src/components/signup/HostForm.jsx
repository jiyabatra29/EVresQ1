import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {useInfo} from "../../context/InfoProvider";


export default function HostForm({ setRole }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    chargerType: "",
    powerOutput: "",
    latitude: "",
    longitude: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
const navigate = useNavigate();
const { login } = useInfo();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:8000/api/host/",
      form
    );

    login({
      token: res.data.token,
      role: "host",
      id: res.data._id,
    });

    navigate("/host/dashboard");
  } catch (err) {
    alert("Host signup failed");
  }
};


  return (
    <
    >
      {/* SIMPLE MEDIUM WHITE BOX */}
      <form
        onSubmit={handleSubmit}
        style={{
          width: "350px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "30px 25px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => setRole("")}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#f0f0f0",
            cursor: "pointer",
            fontWeight: "500",
            marginBottom: "10px",
          }}
        >
          ← Back to Role Selection
        </button>

        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Host Signup</h2>

        <input
          name="name"
          type="text"
          placeholder="Name"
          required
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="phone"
          type="text"
          placeholder="Phone"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="location"
          type="text"
          placeholder="Location"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="chargerType"
          type="text"
          placeholder="Charger Type"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="powerOutput"
          type="text"
          placeholder="Power Output (kW)"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="latitude"
          type="number"
          placeholder="Latitude"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          name="longitude"
          type="number"
          placeholder="Longitude"
          onChange={handleChange}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "5px",
          }}
        >
          Create Account
        </button>
      </form>
    </>
  );
}
