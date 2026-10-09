# BriefProof

**Did the deliverable actually match the brief?**

BriefProof is a browser-only visual acceptance workspace powered by the reusable
**Multimodal Acceptance Matrix** Intelligent Contract. A creator fixes a brief,
a public HTTPS image and 1–6 criteria. Independent GenLayer Leader / Validator
reasoning persists a matrix and deterministic verdict; the frontend displays the
contract's persisted values without deriving or replacing its decision.

## Current status

**Phase 5: public GitHub Pages demo live; submission-readiness checks ongoing.**

- Public Demo: https://halihalibt.github.io/briefproof-genlayer/
- Verified persisted Review #1: https://halihalibt.github.io/briefproof-genlayer/#/review/1
- The owner confirmed that the hosted site displays the verified result in Chrome
  and continues to read EVALUATED / ACCEPTED and 5/5 PASS after F5 refresh.
- OKX Wallet appears connected in the hosted UI, but a live write initiated
  **from this hosted site** has not been performed or verified. The three actual
  existing writes were manually signed in GenLayer Studio.

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

- Full deterministic suite: **141 PASS / 0 FAIL / 0 SKIPPED** (verified by
  GitHub Actions on the submission-readiness PR): 109 prior cases, 29 focused
  Phase 4 cases and 3 new historical-review recovery cases.
- TypeScript: **PASS**. Production build: **PASS** in PR CI.
- Repository A full approved suite: **219 PASS / 0 FAIL / 0 SKIPPED**.
- Actual SDK get_review_count/get_review readback: **PASS**, without wallet.
- Actual mounted React first-load and fresh-gateway/remount reconstruction:
  **1 live read-only test PASS**, using native fetch, real SDK and RPC in JSDOM.
- Phase 4's isolated Work environment did not have usable Chromium. Later,
  the owner verified the **hosted** site in Chrome: image, live Review #1,
  and F5 persistence passed. Full browser automation and hosted wallet-write
  signing remain unverified.

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
Explicit wallet refusal before a hash removes the journal. Create recovery
requires an actual submitted hash and a review ID **greater than** the recorded
pre-signature onchain review count, as well as an exact creator/specification
match. This prevents a historical identical review from automatically unlocking
a later pending create; old journals without an observed baseline fail closed.
An interrupted signature with no transaction hash remains blocked pending
manual transaction/wallet-history investigation. Concurrent indistinguishable
same-creator creations can still require manual reconciliation. Evaluate recovery
rereads state and clears its journal when EVALUATED. Clearing site storage or using another
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
or new packages were added. Public hosting uses GitHub Pages and the committed
`.github/workflows/pages.yml` workflow; the user confirmed deployment succeeded.

## MIT license and submission boundary

This repository, including the **full byte-identical Intelligent Contract source**
under `intelligent-contract/contracts/multimodal_acceptance_matrix.py`, is
licensed under [MIT](LICENSE) with the owner's explicit approval. The canonical
source in Repository A and deployed contract bytes are unchanged. All previously
recorded onchain transactions remain historical user-generated proof; this
submission-readiness patch sends **no new transactions**. Portal submission and
new hosted write-signing verification are not claimed complete.
