# WORK MASTER PLAN V1 — BriefProof

## Objective

Build Repository B as the Projects submission for the already-frozen Multimodal Acceptance Matrix primitive.

BriefProof must demonstrate the contract through a polished, simple browser workflow without adding infrastructure.

## Core User Flow

Home
→ Connect wallet
→ Create Review
→ enter Brief
→ enter public HTTPS image URL
→ define 1–6 criteria
→ submit create_review transaction
→ open Review Detail
→ creator calls evaluate
→ wait for GenLayer result
→ render persisted Acceptance Matrix + final verdict

## Hard Architecture Constraints

Required:
- Vite
- React
- TypeScript
- genlayer-js
- Plain CSS
- browser-only contract interaction
- static-host compatible
- no backend
- no database
- no paid API
- no account/auth system
- no second blockchain
- no token/payment/escrow
- no file-upload infrastructure
- no automatic transaction retries

## Authorized PHASE 3

PHASE 3 is frontend implementation and local verification only.

Implement:
- project scaffold
- wallet/network integration layer
- contract configuration abstraction
- Home
- Create Review
- Review Detail
- built-in Campaign Banner demo asset
- transaction lifecycle UI
- deterministic readback/rendering
- reload reconstruction
- user-facing error states
- component/unit tests
- production build

Do NOT:
- deploy the Intelligent Contract
- call a real GenLayer network
- send transactions
- use faucet
- enable production hosting yet
- create fake onchain evidence
- invent a contract address
- modify Repository A
- change contract business semantics

If no deployed contract exists yet, frontend must support a clearly documented configuration placeholder/mocked test boundary without pretending the app is already live.

## PHASE 3 Acceptance Gate

- frontend tests pass
- production build passes
- no backend/server dependency
- no secret required for static build
- routes work after reload/static hosting strategy is accounted for
- create form enforces frozen input rules
- review detail faithfully renders PENDING/EVALUATED states
- wallet/write actions are explicit and never auto-retried
- README/checkpoint accurately state that real network verification is still pending

STOP after Phase 3.
