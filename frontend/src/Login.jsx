import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Cuando el perfil carga, lo mandamos a su portafolio
  useEffect(() => {
    if (profile) navigate(`/p/${profile.username}`);
  }, [profile, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

 return (
  <div className="auth">
    <form className="card auth-card" onSubmit={handleSubmit}>
      <h2>{isSignUp ? "Crear cuenta" : "Iniciar sesión"}</h2>
      <input type="email" placeholder="Correo" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Contraseña" value={password}
        onChange={(e) => setPassword(e.target.value)} minLength={6} required />
      <button className="btn" type="submit">
        {isSignUp ? "Registrarme" : "Entrar"}
      </button>
      {error && <p className="error">{error}</p>}
      <button className="btn ghost" type="button"
        onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Ya tengo cuenta" : "No tengo cuenta"}
      </button>
    </form>
  </div>
);
}