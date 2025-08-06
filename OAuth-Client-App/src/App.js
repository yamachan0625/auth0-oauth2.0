import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Navigation from "./components/Navigation";
import Loading from "./components/Loading";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ApiTest from "./pages/ApiTest";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <Navigation />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/api-test" element={<ApiTest />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;