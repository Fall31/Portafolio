import { vi } from "vitest";

export function queryMock(result) {
  const q = {};
  ["select", "eq", "order", "insert", "update", "delete"].forEach((m) => {
    q[m] = vi.fn(() => q);
  });
  q.single = vi.fn(() => Promise.resolve(result));
  q.maybeSingle = vi.fn(() => Promise.resolve(result));
  // Permite hacer `await` directamente sobre la cadena
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}