# PROJECT CHECKPOINT — Phase 5 publication / submission-readiness addendum (2026-10-09)

This is a **new checkpoint addendum**. Earlier Phase 4 and prior stage
checkpoints below are historical records and remain intact.

- Phase 4 closure PR and GitHub Pages publication PR were subsequently merged.
- Public website: https://halihalibt.github.io/briefproof-genlayer/
- Verified Review #1: https://halihalibt.github.io/briefproof-genlayer/#/review/1
- The owner inspected the hosted Chrome UI, saw the real ACCEPTED / 5 PASS
  result and successfully reloaded the review. This is a real hosted-origin
  readback check; no hosted frontend **write/signing** was performed.
- The complete production Intelligent Contract at
  `intelligent-contract/contracts/multimodal_acceptance_matrix.py` remains
  byte-for-byte identical to Repository A and the deployed source.
- MIT license was authorized by the owner and is added in this draft PR.
- Pending-create journal recovery is being tightened so a historical
  same-specification review cannot clear a new write lock.
- New tests and documentation changes are **pending pull-request CI**, not
  falsely recorded as already executed. The previous Phase 4 verified baseline
  was 138 frontend tests and 219 Repository A tests.
- No new contracts, upgrades, blockchain transactions or Portal submissions.
- Remaining scope: user review and merge of this draft PR, possible separately
  authorized hosted wallet-write verification, reviewer-facing submission text.

---

# PROJECT CHECKPOINT — BriefProof — Phase 4 closure

## Overall goal

Complete the frozen Intelligent Contract primitive and its BriefProof application
using the same canonical source and Stable Studionet only.

## Current phase and goal

**PHASE 4 CLOSURE — real onchain evidence and frontend integration.**
Record the user's successful deployment/create/evaluate, independently verify
read-only persistence and provenance, enable the existing real frontend, and
prepare a separate draft PR. Stop; do not merge or enter Phase 5.

## Confirmed completed

- Original RPC transactions confirm FINALIZED / Leader SUCCESS / MAJORITY_AGREE.
- Evaluate: Normal, 5 initial validators, 0 rotations, 3 AGREE / 2 DISAGREE.
- Public Explorer evaluation overview and Consensus tab independently inspected.
- Review #1: EVALUATED / ACCEPTED, actual C1–C5 all PASS; exact hashes and brief.
- Source commit `6fed5915a839b9b4336cd4723a69fd80df37fb25`; source SHA256 `563ac0b7c429f571acb45ff427840555105401155aebe2d906e0a8960c56daf2`.
- Canonical A source, complete B copy and deployment transaction code byte identity PASS.
- Real SDK count/review readback and mounted React first-load/remount verified
  without signing wallet. Full Chromium/CORS validation remains limited.

## Validation

Repository A: **219 PASS / 0 FAIL / 0 SKIPPED**, full approved pytest suite.
Repository B: **138 PASS / 0 FAIL / 0 SKIPPED** (109 retained + 29 focused).
TypeScript **PASS**; production build **PASS**.
Live frontend read-only check: **1 PASS**, actual SDK/native fetch, JSDOM mount
and fresh gateway/remount. Never describe this as full Chromium reload evidence.

## Frozen decisions

All architecture/specification/prompt/equivalence decisions remain unchanged.
Canonical production contract source remains unchanged. No alternate network,
backend, mock production review, verdict recomputation or automatic write retry.

## Limitations and unresolved questions

See REAL_NETWORK_EVIDENCE.md. Full browser preview/hosted-origin CORS and frontend
wallet signing are not claimed. Broad negative live-model/error cases remain
unverified. These do not invalidate the independently verified successful
onchain example or the actual local React read/reconstruction test.

## Real network actions / transactions / hosting

Work: existing transaction reads and view calls only. User: three already completed
manual transactions. **No new blockchain transactions sent.** No faucet, contract
deploy/upgrade, hosting, Portal submission, merge or Phase 5 action.

## Rejected options

Inventing five AGREE votes, copying the older brief/spec hash, hard-coding a detail
matrix, broadly refactoring passing integration, changing deployed contract source,
and treating a canceled Validator run as failed Leader execution were rejected.

## Files changed in Phase 4 closure

- `PROJECT_CHECKPOINT.md`
- `README.md`
- `REAL_NETWORK_EVIDENCE.md`
- `intelligent-contract/DEPLOYMENT_MANIFEST_STUDIONET.md`
- `intelligent-contract/SOURCE_PROVENANCE.md`
- `package.json`
- `readonly-check.config.ts`
- `src/App.tsx`
- `src/config.ts`
- `src/integration.ts`
- `src/recovery.ts`
- `src/rpc-http.ts`
- `src/styles.css`
- `tests/App.test.tsx`
- `tests/evidence/create.json`
- `tests/evidence/deployment.json`
- `tests/evidence/evaluate.json`
- `tests/evidence/review-1.json`
- `tests/integration.test.ts`
- `tests/integrity.test.ts`
- `tests/phase4.test.tsx`
- `tests/setup.ts`
- `tsconfig.json`
- `verification/readonly-result.json`
- `verification/readonly.check.tsx`
- `vite.config.ts`

## Scope deviations / stop condition

NONE. Prepare draft PRs and stop for authorization. No automatic Phase 5.

---

## Historical checkpoint (superseded phase status and authorization)

The following records the earlier completed stage. Its earlier network-disabled
scope/status/stop statements are historical; the current Phase 4 instruction and
checkpoint above supersede them. Frozen protocol decisions still apply.

# PROJECT CHECKPOINT — BriefProof

## Overall Goal

Build BriefProof as the Projects application for the independently reusable Multimodal Acceptance Matrix Intelligent Contract, preserving Frozen V1.

## Current Phase

**PHASE 3 — PASS.** Frontend and local acceptance complete; draft PR requested, not merged.

## Phase Goal

Implement the complete static browser frontend, deterministic test boundaries, polished Campaign Banner demo, contract-source copy, local verification, and draft PR. No real chain interaction or hosting.

## Confirmed Completed

- Vite + React + TypeScript + genlayer-js 1.1.8 + plain CSS.
- Static-safe hash routes for Home, Create, Review Detail; relative build assets.
- Responsive light design with large visual artifact and readable criteria/matrix.
- Exact frozen demo criteria, fictional FORMA brand and launch phrase, committed 1600 × 1100 PNG (46,512 bytes), labelled Example / Demo; no fake result.
- Form requirements: title/brief, public HTTPS URL, 1–6 criteria, at least one MUST, auto sequential IDs, exact text preservation, importance/mode selectors.
- Wallet account/network state, explicit connection, event cleanup, creator-only Evaluate controls, unconfigured network gate.
- Lazy SDK-backed integration boundary for all four public methods, conservative receipt polling, persisted readback; no automatic write retry or background write.
- Transaction lifecycle, same-page submitted-hash retention and write lock, explicit refresh, useful missing/invalid/unconfigured/error messages.
- PENDING and EVALUATED rendering, every frozen verdict/result label, creator, hashes, original image and error fallback. No client verdict recomputation.
- Complete canonical source copied with byte identity and SHA256 verification.

## Frozen Decisions / Constraints

Frozen architecture/specification documents unchanged. No backend/database/accounts/uploads/payments/second chain. Only Stable Studionet is the later network target. Phase 3 network gate stays disabled and address unset. Exact criterion text and order are retained. Never label this demo Verified Onchain before genuine Phase 4 evidence. Repository A remains canonical and read only.

## Tests

PASS: **109**
FAIL: **0**
SKIPPED: **0**

- `tests/domain.test.ts`: 40 PASS.
- `tests/integration.test.ts`: 21 PASS.
- `tests/App.test.tsx`: 44 PASS.
- `tests/integrity.test.ts`: 4 PASS.

Frozen test plan B items 1–11: form/domain/component tests.
Items 12–20: wallet/lifecycle/permission and integration/component tests.
Items 21–34: persisted rendering, statuses, hashes/order/image tests.
Items 35–40: hash navigation, create readback, reload/error tests and local browser smoke.
Items 41–46: demo/runtime-evidence/PNG integrity tests.

Local browser smoke: Chromium, desktop 1440 and mobile 390/320; no page errors, horizontal overflow, or external requests. Home/Create/review direct loading and reload checked. Screenshots visually inspected. This is local UI verification, not chain evidence.

## TypeScript

**PASS — `npm run typecheck`.**

## Production Build

**PASS — `npm run build`.** Static `dist/`, no secrets/server, lazy SDK chunks, no chunk-size warning. `git diff --check` passes.

## Files Changed

- `README.md`
- `PROJECT_CHECKPOINT.md`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/App.tsx`
- `src/config.ts`
- `src/demo.ts`
- `src/domain.ts`
- `src/integration.ts`
- `src/main.tsx`
- `src/styles.css`
- `tests/App.test.tsx`
- `tests/domain.test.ts`
- `tests/fixtures.ts`
- `tests/integration.test.ts`
- `tests/integrity.test.ts`
- `tests/setup.ts`
- `public/campaign-banner.png`
- `intelligent-contract/SOURCE_PROVENANCE.md`
- `intelligent-contract/contracts/multimodal_acceptance_matrix.py`

## Dependencies Added

Runtime:
- `react`, `react-dom`: required UI.
- `genlayer-js` **1.1.8 exactly**: required GenLayer boundary; API verified against installed declarations/README.

Development:
- `vite`, `@vitejs/plugin-react`: required static toolchain.
- `typescript`, `@types/react`, `@types/react-dom`: static typing.
- `@types/node`: type checking config and file/hash integrity tests.
- `vitest`, `jsdom`: deterministic local test environment.
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`: component/accessibility/workflow tests.

No routing, CSS component library, animation, backend, database, or additional wallet dependency. Prettier and temporary local Chromium tooling were used outside project dependencies. The SDK's own viem/parser/lint transitive dependencies are not separately added product features. Lockfile committed.

## Canonical Contract Sync

Source repo: `halihalibt/multimodal-acceptance-matrix-genlayer`.
Source commit: `6fed5915a839b9b4336cd4723a69fd80df37fb25`.
Source path: `contracts/multimodal_acceptance_matrix.py`.
Copy: `intelligent-contract/contracts/multimodal_acceptance_matrix.py`.
SHA256: `563ac0b7c429f571acb45ff427840555105401155aebe2d906e0a8960c56daf2`.
Byte identity verification: **PASS**, `git show` piped to `cmp`; source hash independently confirmed and asserted by integrity test. No Repository A files modified.

## Real Network Actions

**NONE** (no GenLayer RPC, no faucet). GitHub and package retrieval were used for implementation.

## Transactions Sent

**NONE**

## Hosting Actions

**NONE**. Local browser/dev/static checks only; no Pages settings or deploy workflow.

## Unresolved Issues / Phase 4 Items

- Obtain separately authorized canonical deployment and actual contract address; configure only Stable Studionet.
- Verify browser wallet signing, actual finalized receipt fields and execution success, create ID recovery, evaluate consensus, persisted readback and reload on the real network.
- Phase 3's transaction hash lock is same-page memory. Durable recovery after a reload is not yet real-network verified; do not assume a reload authorizes resubmission.
- Create recovery is bounded to 12 new reviews and refuses ambiguous exact duplicates. Verify receipt-driven recovery/rate limits in Phase 4 if required.
- Make the PNG publicly HTTPS-accessible under authorized hosting; real validators alone determine C1–C5 and final verdict. Desired PARTIAL/ACCEPTED is not guaranteed or hard-coded.
- Re-synchronize and re-verify source after any approved compatibility patch; add final deployment manifest and genuine transaction evidence.
- Hosting and Portal submission remain separately unauthorized.

## Rejected Options

History-free fake results, fabricated addresses/hashes/votes, automatic write retries, latest-count ID guessing, server-rewrite routing, dependency-heavy UI, and unauthorized deployment were excluded to preserve the frozen scope and evidence integrity.

## Scope Deviations

**NONE**

## Next Recommended Phase

PHASE 4 — separately authorized Stable Studionet deployment and real-network verification, after the Phase 3 draft PR is reviewed/merged. **STOP here; do not enter automatically.**
