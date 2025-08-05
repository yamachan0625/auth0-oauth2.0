import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "@auth0/auth0-react";
import history from "./utils/history";
import { getConfig } from "./config";

const onRedirectCallback = (appState, user) => {
  // サインアップフローの検知
  const isSignupFlow = localStorage.getItem('auth0_signup_flow') === 'true';
  
  if (isSignupFlow && user) {
    // サインアップフラグをクリア
    localStorage.removeItem('auth0_signup_flow');
    
    // サインアップ後はホームページに遷移し、サインアップ完了メッセージを表示
    const url = new URL(window.location.origin);
    url.searchParams.set('signup_complete', 'true');
    window.location.href = url.toString();
    return;
  }
  
  // 通常のログインフローの処理
  history.push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

// Please see https://auth0.github.io/auth0-react/interfaces/Auth0ProviderOptions.html
// for a full list of the available properties on the provider
const config = getConfig();

const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  onRedirectCallback,
  authorizationParams: {
    redirect_uri: window.location.origin,
    ...(config.audience ? { audience: config.audience } : null),
  },
};

const root = createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    {...providerConfig}
  >
    <App />
  </Auth0Provider>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
