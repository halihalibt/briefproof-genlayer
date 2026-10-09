import { it, expect, vi } from "vitest";
import {
  createGateway,
  assertReceipt,
  type SdkBoundary,
  type Provider,
} from "../src/integration";
import { contractConfig } from "../src/config";
import { fixture, spec, creator } from "./fixtures";
const target = "0x3333333333333333333333333333333333333333" as const;
const hash = `0x${"4".repeat(64)}`;
const config = { ...contractConfig, address: target, networkEnabled: true };
function boundary() {
  const sdk: SdkBoundary = {
    readContract: vi
      .fn()
      .mockImplementation(({ functionName }) =>
        Promise.resolve(functionName === "get_review_count" ? 1 : fixture()),
      ),
    writeContract: vi.fn().mockResolvedValue(hash),
    waitForTransactionReceipt: vi.fn().mockResolvedValue({
      status: "FINALIZED",
      txExecutionResultName: "SUCCESS",
    }),
  };
  return sdk;
}
function provider(chain = "0xf22f"): Provider {
  return {
    request: vi
      .fn()
      .mockImplementation(({ method }) =>
        Promise.resolve(method === "eth_chainId" ? chain : [creator]),
      ),
  };
}
it("production config uses the actual canonical Stable Studionet deployment", () => {
  expect(contractConfig.address).toBe("0xFE36de515cD28269E1347faD4f583319e9111312");
  expect(contractConfig.rpcUrl).toBe("https://studio.genlayer.com/api");
  expect(contractConfig.networkEnabled).toBe(true);
  expect(contractConfig.chainId).toBe(61999);
});
it("unconfigured reads cannot construct an SDK or contact RPC", async () => {
  const client = vi.fn();
  const g = createGateway({ config: { ...contractConfig, address: undefined }, client, provider: () => undefined });
  await expect(g.getReview(1)).rejects.toThrow("not configured");
  expect(client).not.toHaveBeenCalled();
});
it("unconfigured writes cannot request signatures", async () => {
  const p = provider();
  const client = vi.fn();
  await expect(
    createGateway({ config: { ...contractConfig, address: undefined }, provider: () => p, client }).evaluate(1, vi.fn()),
  ).rejects.toThrow("not configured");
  expect(p.request).not.toHaveBeenCalled();
  expect(client).not.toHaveBeenCalled();
});
it("Phase 3 gate blocks configured test address unless explicitly enabled", async () => {
  const client = vi.fn();
  const g = createGateway({
    config: { ...config, networkEnabled: false },
    client,
  });
  await expect(g.getReviewCount()).rejects.toThrow("disabled");
  expect(client).not.toHaveBeenCalled();
});
it("supports unavailable wallet", async () =>
  expect(await createGateway({ provider: () => undefined }).snapshot()).toEqual(
    { available: false },
  ));
it("connects only by explicit accounts request", async () => {
  const p = provider();
  const g = createGateway({ provider: () => p });
  expect(await g.connect()).toMatchObject({ address: creator, chainId: 61999 });
  expect(p.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
});
it("snapshot uses nonprompting eth_accounts", async () => {
  const p = provider();
  await createGateway({ provider: () => p }).snapshot();
  expect(p.request).toHaveBeenCalledWith({ method: "eth_accounts" });
});
it("subscribes and cleans up account/network events", () => {
  const p = { ...provider(), on: vi.fn(), removeListener: vi.fn() };
  const fn = vi.fn();
  const unsubscribe = createGateway({ provider: () => p }).subscribe(fn);
  expect(p.on).toHaveBeenCalledWith("chainChanged", fn);
  unsubscribe();
  expect(p.removeListener).toHaveBeenCalledWith("accountsChanged", fn);
});
it("rejects wrong network before write", async () => {
  const sdk = boundary();
  const g = createGateway({
    config,
    provider: () => provider("0x1"),
    client: () => sdk,
  });
  await expect(g.evaluate(1, vi.fn())).rejects.toThrow("Wrong");
  expect(sdk.writeContract).not.toHaveBeenCalled();
});
it("rejects disconnected wallet before write", async () => {
  const sdk = boundary();
  const p: Provider = { request: vi.fn().mockResolvedValue([]) };
  await expect(
    createGateway({ config, provider: () => p, client: () => sdk }).evaluate(
      1,
      vi.fn(),
    ),
  ).rejects.toThrow("Connect");
  expect(sdk.writeContract).not.toHaveBeenCalled();
});
it("uses get_review and schema-validated persisted result", async () => {
  const sdk = boundary();
  const r = await createGateway({ config, client: () => sdk }).getReview(1);
  expect(r).toEqual(fixture());
  expect(sdk.readContract).toHaveBeenCalledWith({
    address: target,
    functionName: "get_review",
    args: [1],
    jsonSafeReturn: true,
  });
});
it("rejects mismatched review ID", async () => {
  const sdk = boundary();
  await expect(
    createGateway({ config, client: () => sdk }).getReview(2),
  ).rejects.toThrow("different review ID");
});
it("uses get_review_count", async () => {
  const sdk = boundary();
  expect(
    await createGateway({ config, client: () => sdk }).getReviewCount(),
  ).toBe(1);
});
it("handles evaluate lifecycle and reads persisted state", async () => {
  const sdk = boundary();
  const progress = vi.fn();
  await createGateway({
    config,
    provider: () => provider(),
    client: () => sdk,
  }).evaluate(1, progress);
  expect(progress.mock.calls.map((c) => c[0])).toEqual([
    "awaiting signature",
    "submitted",
    "waiting for consensus",
    "complete",
  ]);
  expect(sdk.writeContract).toHaveBeenCalledWith({
    address: target,
    functionName: "evaluate",
    args: [1],
    value: 0n,
  });
  expect(sdk.writeContract).toHaveBeenCalledTimes(1);
});
it("never retries failed writes", async () => {
  const sdk = boundary();
  vi.mocked(sdk.writeContract).mockRejectedValue(new Error("4001"));
  await expect(
    createGateway({
      config,
      provider: () => provider(),
      client: () => sdk,
    }).evaluate(1, vi.fn()),
  ).rejects.toThrow("4001");
  expect(sdk.writeContract).toHaveBeenCalledTimes(1);
  expect(sdk.waitForTransactionReceipt).not.toHaveBeenCalled();
});
it("never retries when consensus polling fails", async () => {
  const sdk = boundary();
  vi.mocked(sdk.waitForTransactionReceipt).mockRejectedValue(
    new Error("timeout"),
  );
  await expect(
    createGateway({
      config,
      provider: () => provider(),
      client: () => sdk,
    }).evaluate(1, vi.fn()),
  ).rejects.toThrow("timeout");
  expect(sdk.writeContract).toHaveBeenCalledTimes(1);
});
it("handles create arguments and recovers actual ID by exact readback", async () => {
  const sdk = boundary();
  let counts = 0;
  vi.mocked(sdk.readContract).mockImplementation(async ({ functionName }) =>
    functionName === "get_review_count"
      ? counts++
        ? 1
        : 0
      : fixture({
          status: "PENDING",
          matrix: [],
          verdict: "",
          artifact_hash: "",
        }),
  );
  const progress = vi.fn();
  expect(
    await createGateway({
      config,
      provider: () => provider(),
      client: () => sdk,
    }).createReview(spec, progress),
  ).toBe(1);
  expect(sdk.writeContract).toHaveBeenCalledWith({
    address: target,
    functionName: "create_review",
    args: [spec.title, spec.brief, spec.artifact_url, spec.criteria],
    value: 0n,
  });
  // Before the signing request, the current count is passed to the UI journal.
  expect(progress).toHaveBeenCalledWith("awaiting signature", undefined, 0);
  expect(progress).toHaveBeenLastCalledWith("complete");
});
it("does not guess another concurrent creator review ID", async () => {
  const sdk = boundary();
  let counts = 0;
  vi.mocked(sdk.readContract).mockImplementation(async ({ functionName }) =>
    functionName === "get_review_count"
      ? counts++
        ? 1
        : 0
      : fixture({ title: "Someone else’s review" }),
  );
  await expect(
    createGateway({
      config,
      provider: () => provider(),
      client: () => sdk,
    }).createReview(spec, vi.fn()),
  ).rejects.toThrow("uniquely recovered");
  expect(sdk.writeContract).toHaveBeenCalledTimes(1);
});
it("rejects unsuccessful finalized receipt", () =>
  expect(() =>
    assertReceipt({ status: "FINALIZED", txExecutionResultName: "ERROR" }),
  ).toThrow("did not finalize successfully"));
it("rejects non-finalized receipt even if execution succeeded", () =>
  expect(() =>
    assertReceipt({ status: "ACCEPTED", txExecutionResultName: "SUCCESS" }),
  ).toThrow());
it("create recovery compares criterion fields independently of object key order", async () => {
  const sdk = boundary();
  let counts = 0;
  const r = fixture({
    status: "PENDING",
    matrix: [],
    verdict: "",
    artifact_hash: "",
  });
  r.criteria = r.criteria.map((c) => ({
    assessment_mode: c.assessment_mode,
    importance: c.importance,
    text: c.text,
    id: c.id,
  }));
  vi.mocked(sdk.readContract).mockImplementation(async ({ functionName }) =>
    functionName === "get_review_count" ? (counts++ ? 1 : 0) : r,
  );
  expect(
    await createGateway({
      config,
      provider: () => provider(),
      client: () => sdk,
    }).createReview(spec, vi.fn()),
  ).toBe(1);
});
