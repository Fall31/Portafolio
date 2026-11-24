import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Login from "./Login";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: { auth: { signInWithPassword: vi.fn(), signUp: vi.fn() } },
}));
vi.mock("./AuthContext", () => ({ useAuth: () => ({ profile: null }) }));

describe("Login (integración)", () => {
  it("envía las credenciales a Supabase y muestra el error si fallan", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText("Correo"), "ana@gmail.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "secreto123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "ana@gmail.com",
      password: "secreto123",
    });
    expect(await screen.findByText("Invalid login credentials")).toBeInTheDocument();
  });
  it("permite cambiar a modo registro y crea la cuenta con signUp", async () => {
    supabase.auth.signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "No tengo cuenta" }));
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Correo"), "nuevo@gmail.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "secreto123");
    await user.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "nuevo@gmail.com",
      password: "secreto123",
    });
  });
});