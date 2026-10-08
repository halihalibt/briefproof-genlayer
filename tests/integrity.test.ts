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
it("runtime contains only the actual authorized address and transaction", () => {
  const values = ["src/App.tsx", "src/config.ts", "src/demo.ts", "src/integration.ts"]
    .flatMap(file => readFileSync(file, "utf8").match(/0x[0-9a-f]{40,64}/gi) ?? []);
  expect(values).toEqual([
    "0xFE36de515cD28269E1347faD4f583319e9111312",
    "0xf33c581cf9f1701576d75bcea60724cb1517bc84dd33f1eb3ab03705d770cf69",
  ]);
});
it("uses relative asset base and has no hosting workflow", () => {
  expect(readFileSync("vite.config.ts", "utf8")).toContain('base: "./"');
  expect(existsSync(".github/workflows/deploy.yml")).toBe(false);
});
