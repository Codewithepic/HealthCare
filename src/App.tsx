import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import Home from "./components/home";
import AuthCallback from "./components/auth/AuthCallback";
import PermissionsManager from "./components/PermissionsManager";

function App() {
  // Fetch the Civic App ID from environment variables
  const civicAppId = import.meta.env.VITE_CIVIC_APP_ID || "037c6523-82a9-4f98-b9f0-c3b4d72b80cd";
  
  return (
    <CivicAuthProvider 
      clientId={civicAppId}
    >
      <PermissionsManager>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Suspense>
      </PermissionsManager>
    </CivicAuthProvider>
  );
}

export default App;

