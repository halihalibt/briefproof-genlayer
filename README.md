# BriefProof

**Did the deliverable actually match the brief?**

BriefProof is a browser-only visual acceptance workspace using the **Multimodal Acceptance Matrix** Intelligent Contract. A creator defines a brief, attaches a public HTTPS image, and specifies 1–6 acceptance criteria. Independent GenLayer Leader / Validator evaluation persists a criterion matrix and final verdict; the frontend displays those persisted results without recomputing the decision.

## Current status

**Phase 3 frontend: complete and locally verified. Real network verification: pending.**

No contract has been deployed by this phase. No real GenLayer RPC requests, transactions, faucet use, or hosting actions were performed. Repository A was not modified. The Campaign Banner is a clearly labelled static **Example / Demo**, with no fabricated onchain outcome.

## Local development

Requires Node.js 22.12+ (validated on Node.js 24.19.0) and npm.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run preview
```

The production output is `dist/`: ordinary static files with relative assets, no backend, database, secrets, remote font service, or paid API. Hosting is not enabled in this phase.

## Routes

Hash routing preserves the frozen logical routes without server rewrites:

| Logical route | Static URL suffix | Purpose |
| --- | --- | --- |
| `/` | `#/` | Product explanation, workflow, wallet state, Campaign Banner example |
| `/create` | `#/create` | Immutable brief, HTTPS artifact URL, sequential C1…Cn criterion editor |
| `/review/:id` | `#/review/1` | Read persisted review; creator-only evaluation; matrix, verdict, hashes |

`#/create?demo=campaign` starts with the frozen Campaign Banner brief and criteria. Its artifact URL remains empty until a public HTTPS URL is available. Direct review navigation and reload read the review again through the integration boundary; no in-memory or fabricated result is treated as chain state.

## Unconfigured contract behavior

`src/config.ts` intentionally has **no address** and `networkEnabled: false`. This is a Phase 3 network gate, not a placeholder contract pretending to be deployed. Preparing a form and viewing the static demo work normally; submission/evaluation are disabled, and review reads show a useful unconfigured message. SDK clients are only constructed after configuration checks. No environment variable can quietly enable production writes.

Wallet connection uses explicit `eth_requestAccounts`; passive account/network state uses `eth_accounts` and `eth_chainId`. Account/network changes update controls. The app does not automatically switch/add a network. The target is **Stable Studionet, chain ID 61999**. A wrong or unavailable wallet chain disables writes.

`src/integration.ts` isolates `create_review`, `evaluate`, `get_review`, and `get_review_count`, using the installed **genlayer-js 1.1.8** API. SDK modules load lazily. Tests inject deterministic wallet/SDK boundaries; the shipped UI has no mock review database or fake onchain evidence.

Writes require explicit actions, show signature/submitted/consensus/failure/completion states, and never automatically retry. Submitted hashes stay visible in the current page and lock duplicate writes even after a polling failure. Evaluation refresh reads persisted state. Creation confirms the new ID by matching creator and exact immutable input across at most 12 new reviews; it never guesses that the latest count belongs to this caller. If readback is ambiguous or excessively concurrent, it stops and requests manual recovery without resubmitting. Real receipt behavior and durable transaction recovery must be verified in the separately authorized Phase 4.

## Local validation

- **109 PASS / 0 FAIL / 0 SKIPPED**, across four test files.
- TypeScript check: **PASS**.
- Production build: **PASS**, SDK split into lazy chunks.
- Local Chromium smoke: Home/Create, direct review loading, reload, 1440/390/320 pixel layouts; no horizontal overflow, no page errors, no external requests.
- Tests cover frozen form rules, add/remove/renumber/cap, wallet and network changes, all transaction states, duplicate prevention, creator controls, all verdict/cell labels, hashes, immutable order, image fallback, reload, missing IDs, demo integrity, and the network gate.

## Canonical contract synchronization

Repository A: `halihalibt/multimodal-acceptance-matrix-genlayer`.

Approved source commit: `6fed5915a839b9b4336cd4723a69fd80df37fb25`.

Complete copy: `intelligent-contract/contracts/multimodal_acceptance_matrix.py`.

SHA256: `563ac0b7c429f571acb45ff427840555105401155aebe2d906e0a8960c56daf2`.

Byte identity: **PASS**. See `intelligent-contract/SOURCE_PROVENANCE.md`. Final re-verification is required after any authorized Phase 4 compatibility patch; final deployment provenance remains pending.

## Authoritative frozen documents

Read before changing implementation:

1. `WORK_MASTER_PLAN.md`
2. `IMPLEMENTATION_SPEC_B.md`
3. `UI_SYSTEM_V1.md`
4. `TEST_AND_ACCEPTANCE_PLAN_B.md`
5. `CONTRACT_SOURCE_POLICY.md`
6. `WORK_EXECUTION_RULES.md`
7. `WORK_PROGRESS_TEMPLATE.md`

`PROJECT_CHECKPOINT.md` records this phase's acceptance, files, dependencies, constraints, and unresolved work. Do not redesign the product or proceed to Phase 4 without explicit authorization.
