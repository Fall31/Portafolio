import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

async function login(page) {
  await page.goto("/login");
  await page.getByPlaceholder("Correo").fill(EMAIL);
  await page.getByPlaceholder("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/p\/.+/);
}

test("sin sesión: / redirige al login y un portafolio inexistente muestra aviso", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

  await page.goto("/p/usuario-que-no-existe-xyz");
  await expect(page.getByText("Este portafolio no existe.")).toBeVisible();
});

test.describe("con usuario de prueba", () => {
  test.skip(!EMAIL || !PASSWORD, "Define E2E_EMAIL y E2E_PASSWORD");

  test("login: rechaza contraseña incorrecta, entra con la correcta y cierra sesión", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Correo").fill(EMAIL);
    await page.getByPlaceholder("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();

    await login(page);
    await expect(page.getByRole("button", { name: "Editar perfil" })).toBeVisible();

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("el dueño edita su perfil y crea y elimina un proyecto", async ({ page }) => {
    await login(page);

    // Editar perfil
    await page.getByRole("button", { name: "Editar perfil" }).click();
    await page.getByPlaceholder("Tu nombre").fill("Tester E2E");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("heading", { name: "Tester E2E" })).toBeVisible();

    // Crear proyecto
    const title = `Proyecto E2E ${Date.now()}`;
    await page.getByPlaceholder("Título").fill(title);
    await page.getByPlaceholder("Descripción").fill("Creado por Playwright");
    await page.getByRole("button", { name: "Agregar", exact: true }).click();
    const card = page.locator("article", { hasText: title });
    await expect(card).toBeVisible();

    // Eliminar proyecto (acepta el confirm del navegador)
    page.once("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Eliminar" }).click();
    await expect(card).toHaveCount(0);
  });
  test("un visitante sin sesión ve el portafolio público sin controles de edición", async ({ page, browser }) => {
    await login(page);
    const portfolioUrl = page.url();
    await expect(page.getByRole("button", { name: "Editar perfil" })).toBeVisible();

    // Contexto nuevo = navegador sin sesión
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();
    await visitor.goto(portfolioUrl);

    await expect(visitor.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(visitor.getByRole("button", { name: "Editar perfil" })).toHaveCount(0);
    await expect(visitor.getByPlaceholder("Título")).toHaveCount(0);
    await expect(visitor.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();

    await visitorContext.close();
  });
});
test("la pantalla de login alterna entre iniciar sesión y crear cuenta", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();

  await page.getByRole("button", { name: "No tengo cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Registrarme" })).toBeVisible();

  await page.getByRole("button", { name: "Ya tengo cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});

test("el formulario de login exige correo y contraseña antes de enviar", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar" }).click();

  // La validación nativa del navegador bloquea el envío
  await expect(page).toHaveURL(/\/login$/);
  const faltaCorreo = await page
    .getByPlaceholder("Correo")
    .evaluate((el) => el.validity.valueMissing);
  expect(faltaCorreo).toBe(true);
});