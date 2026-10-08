# BriefProof

**Did the deliverable actually match the brief?**

BriefProof is a browser-only visual acceptance workspace powered by the reusable
**Multimodal Acceptance Matrix** Intelligent Contract. A creator fixes a brief,
a public HTTPS image and 1–6 criteria. Independent GenLayer Leader / Validator
reasoning persists a matrix and deterministic verdict; the frontend displays the
contract's persisted values without deriving or replacing its decision.

## Current status

**Phase 4 closure: real onchain E2E verified and real integration enabled.**

The user manually completed deployment, create_review and evaluate in Studio.
Work independently retrieved the original transactions and persisted Review #1:
EVALUATED / ACCEPTED, **C1–C5 all PASS**. Evaluation: Normal, 5 initial validators,
0 rotations, **3 AGREE / 2 DISAGREE**. This is not five AGREE votes.

[REAL_NETWORK_EVIDENCE.md](REAL_NETWORK_EVIDENCE.md) records the precise evidence,
actual brief/spec hash, raw vote-map entries, persistence checks and limitations.
[Deployment manifest](intelligent-contract/DEPLOYMENT_MANIFEST_STUDIONET.md)
identifies the exact deployed source and all three transactions.

## Local development and validation

Requires Node.js 22.12+ and npm. Runtime SDK remains **genlayer-js 1.1.8** exactly.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

- Full deterministic suite: **138 PASS / 0 FAIL / 0 SKIPPED**: all 109 prior cases
  retained (only obsolete Phase 3 configuration/evidence assertions updated),
  plus 29 focused Phase 4 cases.
- TypeScript: **PASS**. Production build: **PASS**.
- Repository A full approved suite: **219 PASS / 0 FAIL / 0 SKIPPED**.
- Actual SDK get_review_count/get_review readback: **PASS**, without wallet.
- Actual mounted React first-load and fresh-gateway/remount reconstruction:
  **1 live read-only test PASS**, using native fetch, real SDK and RPC in JSDOM.
- Full Chromium smoke and hosted-origin CORS: **not verified in this closure**.
  Workspace Chromium is unavailable and its download returned an invalid ZIP;
  Cloud Browser cannot reach the local workspace (ERR_CONNECTION_REFUSED).

To repeat the separately opt-in live read-only check:

```sh
npm run verify:readonly
```

It allows only gen_call/read to the authorized RPC, never writes, and records
`verification/readonly-result.json`. Ordinary npm test forbids live network.
`tests/evidence` contains selected original transaction fields and the actual
SDK-normalized Review #1 for deterministic tests; production never imports these
snapshots. No mock review is shipped as production detail data.

## Routes and verified example

| Logical route | Static URL suffix | Purpose |
| --- | --- | --- |
| `/` | `#/` | Explanation, four-step flow and Verified Onchain Example |
| `/create` | `#/create` | Immutable brief, image URL and sequential criteria |
| `/review/:id` | `#/review/1` | Actual contract readback and persisted matrix |

Home displays the real Campaign Banner Review historical evidence summary:
ACCEPTED, 5/5 PASS, contract and evaluation transaction. Its relative link opens
`#/review/1`; Detail always obtains its result through get_review. Network failure
shows an error, never a hard-coded result fallback. The separate Example / Demo
starter prefills only the approved brief/criteria, with no fabricated matrix.

## Real configuration and transaction safety

`src/config.ts` enables only **Stable Studionet, chain ID 61999**, with:

- RPC: `https://studio.genlayer.com/api`.
- Canonical contract: `0xFE36de515cD28269E1347faD4f583319e9111312`.
- Explorer: `https://explorer-studio.genlayer.com`.

The SDK endpoint is explicit. Read-only review access works without a wallet.
Wallet connection uses explicit eth_requestAccounts; passive state uses
eth_accounts/eth_chainId. Account/network events update controls. Wrong or
unavailable chain disables writes; no automatic chain switch/add occurs.
Evaluate is visible only to the original creator while PENDING.

Writes occur only after explicit user actions and wallet authorization; no
write retry or automatic submission is implemented. Receipt polling requests
FINALIZED every 10 seconds, bounded to 30 retries, and stops on transport error.
The parser requires actual Leader SUCCESS, checks named execution and GenVM
errors, and does not mistake canceled Validator runs for application failure.
FINALIZED with failed Leader execution never reaches completion.

Before a signature request, the UI durably journals its action in localStorage.
Submitted hashes survive refresh and link to Explorer. An interrupted/unknown
signature outcome or submitted hash blocks duplicate writes after reload.
Explicit wallet refusal before a hash removes the journal. Create recovery lets
users open the known review ID and releases the lock only after readback matches
creator and every immutable specification field. Evaluate recovery rereads state
and clears its journal when EVALUATED. Clearing site storage or using another
browser cannot preserve this local journal; do not assume it proves no prior write.

Reads deduplicate identical in-flight calls without caching future readback.
The narrow HTTP guard preserves 429/Retry-After before the pinned SDK parses
JSON, applies a shared minimum 60-second cooldown and affects only the authorized
RPC URL. Other fetches/successful responses pass through unchanged. Explicit
refreshes during cooldown fail locally; no retry amplification occurs. 429 and
503 paths are tested without intentionally exhausting the public bucket.

## Canonical source and frozen scope

Source Repository A: `halihalibt/multimodal-acceptance-matrix-genlayer`.
Exact deployed source commit: `6fed5915a839b9b4336cd4723a69fd80df37fb25`.
Complete source copy: `intelligent-contract/contracts/multimodal_acceptance_matrix.py`.
SHA256: `563ac0b7c429f571acb45ff427840555105401155aebe2d906e0a8960c56daf2`.

**Byte identity PASS** between A, B and decoded deployment transaction code.
Neither production source copy changed. See
[SOURCE_PROVENANCE.md](intelligent-contract/SOURCE_PROVENANCE.md).

Frozen documents remain authoritative: WORK_MASTER_PLAN.md,
IMPLEMENTATION_SPEC_B.md, UI_SYSTEM_V1.md, TEST_AND_ACCEPTANCE_PLAN_B.md,
CONTRACT_SOURCE_POLICY.md, WORK_EXECUTION_RULES.md, WORK_PROGRESS_TEMPLATE.md.
Their earlier Phase 3 authorizations are superseded only by the user's explicit
Phase 4 closure instruction; their architecture/semantic constraints still apply.
[PROJECT_CHECKPOINT.md](PROJECT_CHECKPOINT.md) records the current completed stage.

The build is ordinary static dist files with relative assets and hash routing;
no backend, database, server, secrets or paid API is needed. No dependency upgrades
or new packages were added. Hosting is not enabled.

**No new blockchain transactions sent.** No deploy/upgrade, faucet, hosting,
automatic merge, Portal submission or Phase 5. Draft PR review is the stop point.
