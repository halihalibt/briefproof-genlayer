import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
afterEach(cleanup);
beforeEach(() => {
  window.location.hash = "/";
  localStorage.clear();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Live network forbidden in deterministic tests.");
    }),
  );
});
