// Phase 4: the manually deployed canonical contract; Stable Studionet only.
export const contractConfig = Object.freeze({
  phase: 4,
  networkEnabled: true as boolean,
  address: "0xFE36de515cD28269E1347faD4f583319e9111312" as `0x${string}` | undefined,
  chainId: 61999,
  networkName: "Stable Studionet",
  rpcUrl: "https://studio.genlayer.com/api",
  explorerUrl: "https://explorer-studio.genlayer.com",
});
// Historical evidence summary only. Detail pages always read the contract.
export const verifiedExample = Object.freeze({
  reviewId: 1,
  title: "Campaign Banner Review",
  verdict: "ACCEPTED",
  summary: "5/5 PASS",
  evaluationTransaction: "0xf33c581cf9f1701576d75bcea60724cb1517bc84dd33f1eb3ab03705d770cf69",
});
