import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Portfolio from "./Portofolio";
import { useAuth } from "./AuthContext";
import "./index.css";

function Home() {
  const { session, profile } = useAuth();
  if (session === undefined) return <p>Cargando…</p>;
  if (profile) return <Navigate to={`/p/${profile.username}`} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p/:username" element={<Portfolio />} />
    </Routes>
  );
}