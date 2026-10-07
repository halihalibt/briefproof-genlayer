import type { TransactionStatus } from "genlayer-js/types";
import { contractConfig } from "./config";
import {
  parseReview,
  type Specification,
  type Review,
  type Progress,
} from "./domain";
export type Address = `0x${string}`;
export interface WalletSnapshot {
  address?: Address;
  chainId?: number;
  available: boolean;
}
export interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}
export interface Gateway {
  configured: boolean;
  networkEnabled: boolean;
  snapshot(): Promise<WalletSnapshot>;
  connect(): Promise<WalletSnapshot>;
  subscribe(handler: () => void): () => void;
  getReview(id: number): Promise<Review>;
  getReviewCount(): Promise<number>;
  createReview(spec: Specification, progress: Progress): Promise<number>;
  evaluate(id: number, progress: Progress): Promise<void>;
}
export interface SdkBoundary {
  readContract(args: {
    address: Address;
    functionName: string;
    args: unknown[];
    jsonSafeReturn: true;
  }): Promise<unknown>;
  writeContract(args: {
    address: Address;
    functionName: string;
    args: unknown[];
    value: bigint;
  }): Promise<unknown>;
  waitForTransactionReceipt(args: {
    hash: Address;
    status: TransactionStatus;
    interval: number;
    retries: number;
  }): Promise<unknown>;
}
function browserProvider(): Provider | undefined {
  return (window as unknown as { ethereum?: Provider }).ethereum;
}
function address(value: unknown): Address | undefined {
  return typeof value === "string" && /^0x[0-9a-f]{40}$/i.test(value)
    ? (value as Address)
    : undefined;
}
function normalizeCount(value: unknown): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("Invalid review count returned by contract.");
  return n;
}
export function assertReceipt(value: unknown): void {
  const r = value as {
    status?: unknown;
    statusName?: unknown;
    txExecutionResultName?: unknown;
    consensus_data?: { leader_receipt?: { execution_result?: string }[] };
  } | null;
  const success =
    r?.txExecutionResultName === "SUCCESS" ||
    r?.consensus_data?.leader_receipt?.[0]?.execution_result === "SUCCESS";
  if (
    !r ||
    (r.status !== "FINALIZED" && r.statusName !== "FINALIZED") ||
    !success
  )
    throw new Error(
      "The transaction did not finalize successfully. Refresh before considering another write.",
    );
}
export function createGateway(
  options: {
    provider?: () => Provider | undefined;
    config?: typeof contractConfig;
    client?: (
      account?: Address,
      provider?: Provider,
    ) => SdkBoundary | Promise<SdkBoundary>;
  } = {},
): Gateway {
  const config = options.config ?? contractConfig;
  const provider = options.provider ?? browserProvider;
  // SDK construction is lazy: even an unconfigured read cannot initiate RPC.
  const client =
    options.client ??
    (async (account?: Address, p?: Provider) => {
      const [{ createClient }, { studionet }] = await Promise.all([
        import("genlayer-js"),
        import("genlayer-js/chains"),
      ]);
      return createClient({
        chain: studionet,
        account,
        provider: p as never,
      }) as unknown as SdkBoundary;
    });
  function requireConfig(): Address {
    if (!config.address)
      throw new Error(
        "Contract not configured. Real network verification is pending.",
      );
    if (!config.networkEnabled)
      throw new Error("Real network access is disabled in Phase 3.");
    return config.address;
  }
  async function snapshot(request = false): Promise<WalletSnapshot> {
    const p = provider();
    if (!p) return { available: false };
    const accounts = await p.request({
      method: request ? "eth_requestAccounts" : "eth_accounts",
    });
    const chain = await p.request({ method: "eth_chainId" });
    const chainId =
      typeof chain === "string" ? Number.parseInt(chain, 16) : undefined;
    return {
      available: true,
      address: Array.isArray(accounts) ? address(accounts[0]) : undefined,
      chainId: Number.isSafeInteger(chainId) ? chainId : undefined,
    };
  }
  const read = async (method: string, args: unknown[]) => {
    const target = requireConfig();
    return (await client()).readContract({
      address: target,
      functionName: method,
      args,
      jsonSafeReturn: true,
    });
  };
  const gateway: Gateway = {
    configured: !!config.address,
    networkEnabled: config.networkEnabled,
    snapshot: () => snapshot(),
    connect: () => snapshot(true),
    subscribe(handler) {
      const p = provider();
      p?.on?.("accountsChanged", handler);
      p?.on?.("chainChanged", handler);
      return () => {
        p?.removeListener?.("accountsChanged", handler);
        p?.removeListener?.("chainChanged", handler);
      };
    },
    async getReview(id) {
      const r = parseReview(await read("get_review", [id]));
      if (r.review_id !== id)
        throw new Error("The contract returned a different review ID.");
      return r;
    },
    async getReviewCount() {
      return normalizeCount(await read("get_review_count", []));
    },
    async createReview(spec, progress) {
      const before = await gateway.getReviewCount();
      const owner = await write(
        "create_review",
        [spec.title, spec.brief, spec.artifact_url, spec.criteria],
        progress,
      );
      // Match readback, never assume count == this transaction's created ID.
      const after = await gateway.getReviewCount();
      if (after - before > 12)
        throw new Error(
          "Transaction finalized. Locate your review manually; too many concurrent creations for safe automatic recovery. Do not resubmit.",
        );
      const matches: number[] = [];
      for (let id = before + 1; id <= after; id++) {
        const r = await gateway.getReview(id);
        if (
          r.creator.toLowerCase() === owner.toLowerCase() &&
          r.title === spec.title &&
          r.brief === spec.brief &&
          r.artifact_url === spec.artifact_url &&
          r.criteria.length === spec.criteria.length &&
          r.criteria.every((c, i) => {
            const expected = spec.criteria[i];
            return (
              c.id === expected.id &&
              c.text === expected.text &&
              c.importance === expected.importance &&
              c.assessment_mode === expected.assessment_mode
            );
          })
        )
          matches.push(id);
      }
      if (matches.length !== 1)
        throw new Error(
          "Transaction finalized, but its review ID could not be uniquely recovered. Do not resubmit; use the submitted transaction for recovery.",
        );
      progress("complete");
      return matches[0];
    },
    async evaluate(id, progress) {
      await write("evaluate", [id], progress);
      const r = await gateway.getReview(id);
      if (r.status !== "EVALUATED")
        throw new Error(
          "Transaction finalized; persisted evaluation is not available yet. Refresh without resubmitting.",
        );
      progress("complete");
    },
  };
  async function write(
    method: string,
    args: unknown[],
    progress: Progress,
  ): Promise<Address> {
    const target = requireConfig();
    const wallet = await snapshot();
    if (!wallet.address) throw new Error("Connect a wallet first.");
    if (wallet.chainId !== config.chainId)
      throw new Error(
        "Wrong or unavailable network. Select Stable Studionet in your wallet.",
      );
    progress("awaiting signature");
    const sdk = await client(wallet.address, provider());
    const hash = await sdk.writeContract({
      address: target,
      functionName: method,
      args,
      value: 0n,
    });
    if (typeof hash !== "string" || !/^0x[0-9a-f]{64}$/i.test(hash))
      throw new Error(
        "Wallet returned no valid transaction hash. Check wallet history before retrying.",
      );
    progress("submitted", hash);
    progress("waiting for consensus", hash);
    const receipt = await sdk.waitForTransactionReceipt({
      hash: hash as Address,
      status: "FINALIZED" as TransactionStatus,
      interval: 5000,
      retries: 60,
    });
    assertReceipt(receipt);
    return wallet.address;
  }
  return gateway;
}
