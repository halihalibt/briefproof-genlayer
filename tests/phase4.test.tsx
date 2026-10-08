import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { App } from "../src/App";
import { createGateway, assertReceipt, normalizeCount, type SdkBoundary } from "../src/integration";
import { contractConfig } from "../src/config";
import { installRpcHttpGuard } from "../src/rpc-http";
import { rememberWrite, pendingWrite, recoverCreatedReview } from "../src/recovery";
import { mockGateway, creator, fixture } from "./fixtures";
const evidence = (name: string) => JSON.parse(readFileSync(`tests/evidence/${name}.json`, "utf8"));
function sdk(): SdkBoundary {
  return { readContract: vi.fn().mockResolvedValue(evidence("review-1")),
    writeContract: vi.fn(), waitForTransactionReceipt: vi.fn() };
}
it("verified homepage links directly to the real review and transaction", async () => {
  render(<App gateway={mockGateway()} />);
  const section = within(screen.getByRole("region", { name: "Verified Onchain Example" }));
  expect(section.getByText("ACCEPTED · 5/5 PASS")).toBeVisible();
  expect(section.getByRole("link", { name: /Open verified/ })).toHaveAttribute("href", "#/review/1");
  expect(section.getByText(`Contract: ${contractConfig.address}`)).toBeVisible();
  expect(section.getByRole("link", { name: /Evaluation transaction/ })).toHaveAttribute("href",
    "https://explorer-studio.genlayer.com/tx/0xf33c581cf9f1701576d75bcea60724cb1517bc84dd33f1eb3ab03705d770cf69");
});
it("real SDK object readback renders exact matrix and reconstructs after reload without wallet", async () => {
  window.location.hash = "/review/1";
  const boundary = sdk();
  const gateway = createGateway({ client: () => boundary, provider: () => undefined });
  const first = render(<App gateway={gateway} />);
  await screen.findByRole("heading", { name: "ACCEPTED" });
  expect(within(screen.getByRole("table", { name: "Acceptance Matrix" })).getAllByText(/✓ PASS/)).toHaveLength(5);
  expect(screen.getByText(evidence("review-1").brief)).toBeVisible();
  first.unmount();
  render(<App gateway={gateway} />);
  await screen.findByRole("heading", { name: "ACCEPTED" });
  expect(boundary.readContract).toHaveBeenCalledTimes(2);
  expect(boundary.writeContract).not.toHaveBeenCalled();
});
it.each(["deployment", "create", "evaluate"])("accepts actual stable SDK receipt %s", name => {
  expect(() => assertReceipt(evidence(name))).not.toThrow();
});
it("rejects leader GenVM failure even when status is FINALIZED and another field says success", () => {
  const receipt = evidence("evaluate");
  receipt.txExecutionResultName = "SUCCESS";
  receipt.consensus_data.leader_receipt[0].execution_result = "ERROR";
  expect(() => assertReceipt(receipt)).toThrow();
});
it("rejects GenVM error code behind a nominal SUCCESS label", () => {
  const receipt = evidence("evaluate");
  receipt.consensus_data.leader_receipt[0].genvm_result.error_code = "EXECUTION_FAILED";
  expect(() => assertReceipt(receipt)).toThrow();
});
it("requires actual execution success, never votes or initial validator count", () => {
  expect(() => assertReceipt({ statusName: "FINALIZED", result: 6, num_of_initial_validators: 5 })).toThrow();
});
it.each([1, 1n, "1"])("normalizes count representation %s", value => expect(normalizeCount(value)).toBe(1));
it.each([null, undefined, true, "", "1.5", -1, "9007199254740992"])("rejects malformed count %s", value => expect(() => normalizeCount(value)).toThrow());
it("deduplicates concurrent identical reads without caching later persisted reads", async () => {
  const boundary = sdk();
  const gateway = createGateway({ client: () => boundary });
  await Promise.all([gateway.getReview(1), gateway.getReview(1)]);
  expect(boundary.readContract).toHaveBeenCalledTimes(1);
  await gateway.getReview(1);
  expect(boundary.readContract).toHaveBeenCalledTimes(2);
});
it("HTTP 429 starts shared read cooldown and never retries automatically", async () => {
  const boundary = sdk();
  vi.mocked(boundary.readContract).mockRejectedValue(Object.assign(new Error("Too many requests"), { status: 429, retryAfter: 10 }));
  const gateway = createGateway({ client: () => boundary });
  await expect(gateway.getReview(1)).rejects.toThrow("429");
  await expect(gateway.getReviewCount()).rejects.toThrow("cooldown");
  expect(boundary.readContract).toHaveBeenCalledTimes(1);
  expect(boundary.writeContract).not.toHaveBeenCalled();
});
it("RPC error remains an error without inventing a review", async () => {
  const boundary = sdk();
  vi.mocked(boundary.readContract).mockRejectedValue(new Error("HTTP 503"));
  await expect(createGateway({ client: () => boundary }).getReview(1)).rejects.toThrow("503");
  expect(boundary.readContract).toHaveBeenCalledTimes(1);
});
it("create submitted hash survives remount and blocks duplicate writes", async () => {
  window.location.hash = "/create";
  const hash = evidence("create").hash;
  rememberWrite("create", hash);
  const gateway = mockGateway();
  render(<App gateway={gateway} />);
  await screen.findByRole("button", { name: /0x1111/ });
  expect(screen.getByRole("button", { name: /Create review/ })).toBeDisabled();
  expect(screen.getByRole("link", { name: new RegExp(hash) })).toHaveAttribute("href", expect.stringContaining(hash));
  expect(gateway.createReview).not.toHaveBeenCalled();
});
it("unknown signature outcome after reload blocks a duplicate evaluate", async () => {
  window.location.hash = "/review/1";
  rememberWrite("evaluate:1");
  const gateway = mockGateway({ getReview: vi.fn().mockResolvedValue(fixture({ creator, status: "PENDING", matrix: [], verdict: "", artifact_hash: "" })) });
  render(<App gateway={gateway} />);
  expect(await screen.findByRole("button", { name: /Evaluate review/ })).toBeDisabled();
  expect(gateway.evaluate).not.toHaveBeenCalled();
});
it("known evaluated readback clears evaluation journal without resending", async () => {
  window.location.hash = "/review/1";
  rememberWrite("evaluate:1", evidence("evaluate").hash);
  render(<App gateway={mockGateway()} />);
  await screen.findByRole("heading", { name: "ACCEPTED" });
  expect(localStorage.length).toBe(0);
});

it("HTTP transport retains 429 even when the response body is non-JSON", async () => {
  const native = vi.fn().mockResolvedValue(new Response("Too many requests", {status:429,headers:{"Retry-After":"120"}}));
  vi.stubGlobal("fetch", native);
  installRpcHttpGuard(contractConfig.rpcUrl);
  await expect(fetch(contractConfig.rpcUrl)).rejects.toMatchObject({status:429,retryAfter:120});
  await expect(fetch(contractConfig.rpcUrl)).rejects.toThrow("cooldown");
  expect(native).toHaveBeenCalledTimes(1);
});
it("HTTP guard preserves successful SDK responses and unrelated fetches", async () => {
  const response = new Response('{"result":"ok"}', {status:200});
  const native = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", native);
  installRpcHttpGuard(contractConfig.rpcUrl);
  expect(await fetch(contractConfig.rpcUrl)).toBe(response);
  expect(await fetch("https://example.test/image.png")).toBe(response);
  expect(native).toHaveBeenCalledTimes(2);
});
it("create recovery also blocks a signature interrupted before returning a hash", async () => {
  window.location.hash="/create"; rememberWrite("create");
  const gateway=mockGateway(); render(<App gateway={gateway} />);
  await screen.findByRole("button",{name:/0x1111/});
  expect(screen.getByRole("button",{name:/Create review/})).toBeDisabled();
  expect(gateway.createReview).not.toHaveBeenCalled();
});
it("HTTP 503 stops without retry or a fabricated result", async () => {
  const native=vi.fn().mockResolvedValue(new Response("unavailable",{status:503}));
  vi.stubGlobal("fetch",native); installRpcHttpGuard(contractConfig.rpcUrl);
  await expect(fetch(contractConfig.rpcUrl)).rejects.toMatchObject({status:503});
  expect(native).toHaveBeenCalledTimes(1);
});

it("created-review recovery unlocks only a matching immutable specification and creator", () => {
  const actual=evidence("review-1");
  rememberWrite("create",evidence("create").hash,actual,actual.creator);
  recoverCreatedReview({...actual,brief:"different"});
  expect(pendingWrite("create")).toBeDefined();
  recoverCreatedReview(actual);
  expect(pendingWrite("create")).toBeUndefined();
});
