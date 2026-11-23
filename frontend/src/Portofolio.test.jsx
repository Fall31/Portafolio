import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Portfolio from "./Portofolio";
import { supabase } from "./supabase";
import { useAuth } from "./AuthContext";
import { queryMock } from "./test/helpers";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: { signOut: vi.fn() },
    storage: { from: vi.fn() },
  },
}));
vi.mock("./AuthContext", () => ({ useAuth: vi.fn() }));

const owner = {
  id: "user-1",
  username: "ana",
  display_name: "Ana Pérez",
  bio: "Desarrolladora web",
  avatar_url: null,
};
const projects = [
  { id: "p1", user_id: "user-1", title: "Mi tienda online", description: "E-commerce", repo_url: "", demo_url: "" },
];

function setupDb() {
  const projectsQ = queryMock({ data: projects, error: null });
  supabase.from.mockImplementation((table) =>
    table === "profiles" ? queryMock({ data: owner, error: null }) : projectsQ
  );
  return projectsQ;
}

function renderPortfolio() {
  return render(
    <MemoryRouter initialEntries={["/p/ana"]}>
      <Routes>
        <Route path="/p/:username" element={<Portfolio />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Portfolio (integración)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un visitante ve el perfil y los proyectos, sin botones de edición", async () => {
    setupDb();
    useAuth.mockReturnValue({ session: null });

    renderPortfolio();

    expect(await screen.findByRole("heading", { name: "Ana Pérez" })).toBeInTheDocument();
    expect(screen.getByText("Mi tienda online")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Título")).not.toBeInTheDocument();
  });

  it("el dueño puede agregar un proyecto y se guarda con su user_id", async () => {
    const projectsQ = setupDb();
    useAuth.mockReturnValue({ session: { user: { id: "user-1" } } });
    const user = userEvent.setup();

    renderPortfolio();

    await screen.findByRole("heading", { name: "Ana Pérez" });
    expect(screen.getByRole("button", { name: "Editar perfil" })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Título"), "Nuevo proyecto");
    await user.type(screen.getByPlaceholderText("Descripción"), "Descripción de prueba");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(projectsQ.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        title: "Nuevo proyecto",
        description: "Descripción de prueba",
      })
    );
  });
});