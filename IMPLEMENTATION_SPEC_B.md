# IMPLEMENTATION SPEC B — BriefProof

## Product Definition

BriefProof is a visual deliverable acceptance workspace powered by the Multimodal Acceptance Matrix Intelligent Contract.

It is not:
- a generic AI critic
- an image generator
- an escrow app
- a dispute court
- a reputation system
- a backend SaaS

Its purpose is to make one GenLayer-native workflow understandable in under one minute.

## Frontend Stack

Exactly:
- Vite
- React
- TypeScript
- genlayer-js
- Plain CSS

Testing may add the minimum standard frontend test dependencies.

Do not replace the stack with Next.js or introduce a server runtime.

## Routes

### `/` — Home

Must include:
- BriefProof name
- concise explanation
- four-step workflow
- wallet/network status
- Create Review CTA
- a clearly labelled demo/example section
- after Phase 4 only: Verified Onchain Example with real Review ID and evidence links

Do not fabricate "verified" status before Phase 4.

### `/create` — Create Review

Fields:
- Title
- Brief
- Artifact URL
- Criteria editor

Criterion row fields:
- text
- importance: MUST / SHOULD
- assessment_mode: BINARY / GRADED

Rules:
- 1–6 criteria
- at least one MUST
- IDs are derived in order C1…Cn, not freely edited by user
- HTTPS artifact URL only
- submit calls the actual create_review method when configured to a real contract
- no automatic transaction retry

### `/review/:id` — Review Detail

Always show:
- Review ID
- title
- creator
- artifact image
- brief
- criteria
- status
- spec_hash when available

For PENDING:
- show Evaluate action only when connected wallet is creator
- explain that evaluation uses independent GenLayer validators
- no fake result placeholder

For EVALUATED:
- render Acceptance Matrix
- render final verdict
- artifact_hash
- spec_hash
- creator
- contract/network context
- transaction/explorer evidence only when real values exist

## Frozen Verdict Labels

- ACCEPTED
- NEEDS_REVISION
- REJECTED
- UNDETERMINED

Do not reinterpret them in frontend state.

## Matrix Rendering

Each criterion row displays:
- criterion ID
- criterion text
- MUST / SHOULD
- BINARY / GRADED
- final status

Statuses:
- PASS
- PARTIAL
- FAIL
- UNKNOWN

Frontend must not recompute or override the contract's persisted matrix/verdict as authoritative state.

## Built-In Demo Scenario

Name:

**Campaign Banner Review**

Brief concept:

Create a premium promotional banner for a fictional product launch.

Frozen criteria:

C1 — Brand name is clearly visible
- MUST / BINARY

C2 — Required launch phrase is present
- MUST / BINARY

C3 — Blue is the dominant visual family
- MUST / BINARY

C4 — No prohibited price or investment claim appears
- MUST / BINARY

C5 — Composition follows a clean, premium, minimal direction
- SHOULD / GRADED

The static demo artwork must be an actual image asset committed to Repository B.

Preferred eventual real result is:
- C1 PASS
- C2 PASS
- C3 PASS
- C4 PASS
- C5 PARTIAL
- Overall ACCEPTED

This result must NOT be hard-coded as real evidence. Actual Phase 4 validator output is authoritative.

## Transaction UX

Explicit states:
- wallet not connected
- wrong/unavailable network
- awaiting wallet signature
- submitted
- waiting for finalization/consensus
- failed
- complete

Writes:
- never automatically retry
- never send duplicate transactions behind the user's back

Reads:
- conservative retry/backoff allowed if necessary
- avoid request amplification

## Configuration

Contract address/network settings must be isolated in a small configuration module.

Until Phase 4:
- no invented production address
- development/test mocks allowed in tests
- public UI must clearly represent unavailable/unconfigured writes rather than pretending deployment exists

## Static Hosting

The production build must be compatible with static hosting.

Routing must be chosen so direct navigation/reload does not require a custom server.

Do not enable hosting in Phase 3 unless explicitly authorized.
