import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InfoProvider } from "./context/InfoProvider";
import "leaflet/dist/leaflet.css";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <InfoProvider>
    <App />
    </InfoProvider>
  </React.StrictMode>
);
