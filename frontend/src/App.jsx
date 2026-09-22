import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function LandingPage() {
  const [apiStatus, setApiStatus] = useState("checking...");

  useEffect(() => {
    axios
      .get("/api/health")
      .then((res) => setApiStatus(res.data.message))
      .catch(() => setApiStatus("Backend not reachable yet"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold text-primary-700 mb-2">
        Smart Insurance Claim Processing &amp; Settlement Management System
      </h1>
      <p className="text-gray-600 mb-6">Milestone 1: Project setup complete.</p>
      <div className="bg-white shadow rounded-lg px-6 py-4 border border-gray-200">
        <p className="text-sm text-gray-500">Backend API status:</p>
        <p className="font-medium text-gray-800">{apiStatus}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
