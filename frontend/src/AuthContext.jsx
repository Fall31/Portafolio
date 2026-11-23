import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = cargando
  const [fetched, setFetched] = useState(null); // { userId, profile }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return; // sin sesión no hay nada que pedir
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setFetched({ userId, profile: data });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // El perfil se deriva: solo vale si corresponde al usuario actual
  const profile = fetched && fetched.userId === userId ? fetched.profile : null;
  
  function setProfile(p) {
    setFetched({ userId, profile: p });
  }

  return (
    <AuthContext.Provider value={{ session, profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}