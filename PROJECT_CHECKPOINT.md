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
