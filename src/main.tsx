import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { initSentry } from "./lib/sentry";
import { registerPermissionWorker } from "./lib/permissionManager";

// Register the permission service worker
registerPermissionWorker().then(registered => {
  console.log('Permission service worker registered:', registered);
});

// Initialize Sentry once at the application entry point
// This prevents multiple instances being created
initSentry();

// Conditionally load TempoDevtools only in development
if (import.meta.env.DEV) {
  import("tempo-devtools").then(({ TempoDevtools }) => {
    TempoDevtools.init();
  }).catch(err => {
    console.error("Failed to load TempoDevtools:", err);
  });
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
