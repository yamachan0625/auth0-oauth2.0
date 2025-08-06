import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

const domain = process.env.REACT_APP_AUTH0_DOMAIN || "dev-hjemkt24m2gmy0ii.us.auth0.com";
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || "YOUR_CLIENT_ID_HERE";
const audience = process.env.REACT_APP_AUTH0_AUDIENCE || "http://localhost:3001";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email read:profile read:api"
      }}
    >
      <App />
    </Auth0Provider>
  </BrowserRouter>
);