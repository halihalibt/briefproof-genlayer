import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], test: {
  environment: "jsdom", include: ["verification/readonly.check.tsx"],
  testTimeout: 90000,
} });
