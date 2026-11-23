import { describe, it, expect } from "vitest";
import { validateAvatar, getInitial, buildAvatarPath } from "./utils";

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