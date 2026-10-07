// Phase 3 is deliberately locked. No address or RPC can enable network calls.
// Phase 4 requires a separately authorized compatibility/configuration patch.
export const contractConfig = Object.freeze({
  phase: 3,
  networkEnabled: false as boolean,
  address: undefined as `0x${string}` | undefined,
  chainId: 61999,
  networkName: "Stable Studionet",
});
