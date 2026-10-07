import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { it, expect } from "vitest";
it("commits a real PNG demo under the contract size bound", () => {
  const body = readFileSync("public/campaign-banner.png");
  expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(body.length).toBeLessThan(2_000_000);
  expect(body.readUInt32BE(16)).toBe(1600);
  expect(body.readUInt32BE(20)).toBe(1100);
});
it("canonical synchronized source matches the approved SHA256", () => {
  const body = readFileSync(
    "intelligent-contract/contracts/multimodal_acceptance_matrix.py",
  );
  expect(createHash("sha256").update(body).digest("hex")).toBe(
    "563ac0b7c429f571acb45ff427840555105401155aebe2d906e0a8960c56daf2",
  );
});
it("runtime code contains no fabricated contract address or transaction hash", () => {
  for (const file of [
    "src/App.tsx",
    "src/config.ts",
    "src/demo.ts",
    "src/integration.ts",
  ])
    expect(readFileSync(file, "utf8")).not.toMatch(/0x[0-9a-f]{40,64}/i);
});
it("uses relative asset base and has no hosting workflow", () => {
  expect(readFileSync("vite.config.ts", "utf8")).toContain('base: "./"');
  expect(existsSync(".github/workflows/deploy.yml")).toBe(false);
});
