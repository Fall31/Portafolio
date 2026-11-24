import { describe, it, expect } from "vitest";
import { validateAvatar, getInitial, buildAvatarPath, isValidEmail, usernameFromEmail, truncateText } from "./utils";

describe("validateAvatar", () => {
  it("rechaza archivos que no son imágenes", () => {
    const file = { type: "application/pdf", size: 1000 };
    expect(validateAvatar(file)).toBe("Elige una imagen.");
  });

  it("rechaza imágenes de más de 2 MB y acepta las válidas", () => {
    const grande = { type: "image/png", size: 3 * 1024 * 1024 };
    const ok = { type: "image/png", size: 500 * 1024 };
    expect(validateAvatar(grande)).toBe("Máximo 2 MB.");
    expect(validateAvatar(ok)).toBeNull();
  });
});

describe("getInitial", () => {
  it("usa la primera letra del nombre en mayúscula, o el username si no hay nombre", () => {
    expect(getInitial({ display_name: "ana", username: "ana99" })).toBe("A");
    expect(getInitial({ display_name: "", username: "luis" })).toBe("L");
  });
});

describe("buildAvatarPath", () => {
  it("genera la ruta <userId>/avatar-<timestamp>.<extensión>", () => {
    expect(buildAvatarPath("user-1", "mi.foto.JPG", 123)).toBe(
      "user-1/avatar-123.JPG"
    );
  });
});
describe("isValidEmail", () => {
  it("acepta correos válidos (ignorando espacios) y rechaza los mal formados", () => {
    expect(isValidEmail("ana@gmail.com")).toBe(true);
    expect(isValidEmail("  ana@gmail.com  ")).toBe(true);
    expect(isValidEmail("ana@gmail")).toBe(false);
    expect(isValidEmail("ana gmail.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("usernameFromEmail", () => {
  it("toma la parte antes del @, en minúsculas y sin caracteres raros", () => {
    expect(usernameFromEmail("Ana.Perez@Gmail.com")).toBe("ana.perez");
    expect(usernameFromEmail("Luis_99+x@gmail.com")).toBe("luis_99x");
  });
});

describe("truncateText", () => {
  it("recorta textos largos con puntos suspensivos y respeta los cortos o vacíos", () => {
    expect(truncateText("hola mundo", 4)).toBe("hola…");
    expect(truncateText("hola", 10)).toBe("hola");
    expect(truncateText("")).toBe("");
    expect(truncateText(null)).toBe("");
  });
});