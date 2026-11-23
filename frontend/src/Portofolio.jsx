import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";

export default function Portfolio() {const { username } = useParams();
  const { session } = useAuth();
  const [owner, setOwner] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isOwner = session && owner && session.user.id === owner.id;

  // Fuerza una nueva carga de datos
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (cancelled) return;
      if (!p) {
        setNotFound(true);
        return;
      }

      const { data: pr } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setNotFound(false);
      setOwner(p);
      setProjects(pr || []);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username, reloadKey]);

  async function uploadAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Elige una imagen.");
    if (file.size > 2 * 1024 * 1024) return alert("Máximo 2 MB.");

    setUploading(true);
    const ext = file.name.split(".").pop();
    // Nombre único para evitar que el navegador muestre la foto vieja en caché
    const path = `${owner.id}/avatar-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) {
      setUploading(false);
      return alert(error.message);
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", owner.id);

    setUploading(false);
    reload();
  }

  async function saveProfile(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from("profiles")
      .update({ display_name: f.get("display_name"), bio: f.get("bio") })
      .eq("id", owner.id);
    if (!error) { setEditing(false); reload(); }
  }

  async function addProject(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabase.from("projects").insert({
      user_id: owner.id,
      title: f.get("title"),
      description: f.get("description"),
      repo_url: f.get("repo_url"),
      demo_url: f.get("demo_url"),
    });
    if (!error) { e.target.reset(); reload(); }
  }

  async function deleteProject(id) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await supabase.from("projects").delete().eq("id", id);
    reload();
  }

  if (notFound) return <p className="status">Este portafolio no existe.</p>;
  if (!owner) return <p className="status">Cargando…</p>;

  const initial = (owner.display_name || owner.username)[0].toUpperCase();

  return (
    <>
      <nav className="topbar">
        <span className="brand">Portafolio</span>
        {isOwner ? (
          <button className="btn ghost" onClick={() => supabase.auth.signOut()}>
            Cerrar sesión
          </button>
        ) : (
          !session && <Link className="btn ghost" to="/login">Iniciar sesión</Link>
        )}
      </nav>

      <main className="container">
        <section className="hero">
          <div className="avatar-wrap">
            {owner.avatar_url ? (
              <img className="avatar" src={owner.avatar_url} alt={owner.display_name} />
            ) : (
              <div className="avatar placeholder">{initial}</div>
            )}
            {isOwner && (
              <label className="avatar-edit">
                {uploading ? "Subiendo…" : "Cambiar foto"}
                <input type="file" accept="image/*" hidden
                  onChange={uploadAvatar} disabled={uploading} />
              </label>
            )}
          </div>

          {editing ? (
            <form className="card edit-form" onSubmit={saveProfile}>
              <input name="display_name" defaultValue={owner.display_name}
                placeholder="Tu nombre" />
              <textarea name="bio" defaultValue={owner.bio}
                placeholder="Cuéntanos sobre ti" rows={4} />
              <div className="row">
                <button className="btn" type="submit">Guardar</button>
                <button className="btn ghost" type="button"
                  onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="hero-text">
              <h1>{owner.display_name}</h1>
              <p className="handle">@{owner.username}</p>
              <p className="bio">{owner.bio || "Aún no hay biografía."}</p>
              {isOwner && (
                <button className="btn" onClick={() => setEditing(true)}>
                  Editar perfil
                </button>
              )}
            </div>
          )}
        </section>

        <section>
          <h2>Proyectos</h2>
          {projects.length === 0 && <p className="muted">Todavía no hay proyectos.</p>}
          <div className="grid">
            {projects.map((p) => (
              <article className="card project" key={p.id}>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="row">
                  {p.demo_url && <a className="link" href={p.demo_url} target="_blank" rel="noreferrer">Demo ↗</a>}
                  {p.repo_url && <a className="link" href={p.repo_url} target="_blank" rel="noreferrer">Código ↗</a>}
                  {isOwner && (
                    <button className="btn danger small" onClick={() => deleteProject(p.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {isOwner && (
            <form className="card add-form" onSubmit={addProject}>
              <h3>Agregar proyecto</h3>
              <input name="title" placeholder="Título" required />
              <textarea name="description" placeholder="Descripción" rows={3} />
              <input name="repo_url" placeholder="URL del repositorio" />
              <input name="demo_url" placeholder="URL de la demo" />
              <button className="btn" type="submit">Agregar</button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}