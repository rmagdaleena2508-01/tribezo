import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Only Chromium browsers (Chrome, Edge) can bend what is behind a glass
// button with an SVG filter, and only they have navigator.userAgentData.
if (navigator.userAgentData && CSS.supports("backdrop-filter", "url(#x)")) {
  document.documentElement.classList.add("can-bend");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
