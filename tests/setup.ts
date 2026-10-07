import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
afterEach(cleanup);
beforeEach(() => {
  window.location.hash = "/";
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Real network forbidden in Phase 3 tests.");
    }),
  );
});
