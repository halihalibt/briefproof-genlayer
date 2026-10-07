# WORK EXECUTION RULES — Repository B

You are implementing an already-designed product.

You are not the product architect.

## First Authorized Run

Only PHASE 3 — BriefProof Frontend is authorized.

## Do Not

- redesign the Intelligent Contract
- modify Repository A
- introduce backend/database/server routes
- introduce Supabase/Firebase/Redis/Prisma
- add login/accounts/profiles
- add file upload infrastructure
- add payment/token/escrow
- add another blockchain
- add cross-chain logic
- add AI chat
- add analytics/admin dashboard
- add appeal/revision/reputation systems
- expand artifact types beyond image URL
- hard-code fake chain evidence
- claim real network verification
- deploy
- use faucet
- send a transaction
- enable hosting
- automatically proceed to Phase 4

## Allowed

- Vite/React/TypeScript scaffold
- genlayer-js integration layer
- minimal routing solution compatible with static hosting
- standard frontend test tooling
- plain CSS
- static demo image
- deterministic mocks/fixtures for local tests
- current contract source synchronization according to CONTRACT_SOURCE_POLICY.md

## Work Discipline

read specs
→ inspect current repo
→ implement minimum complete frontend
→ test
→ fix
→ production build
→ checkpoint
→ draft PR
→ STOP

Avoid speculative refactoring and dependency sprawl.

## Completion Report

Must state:
- exact test count
- build result
- files changed
- dependencies added
- whether canonical contract copy was synchronized
- network actions = NONE
- transactions = NONE
- hosting = NONE
- unresolved Phase 4 items
- scope deviations
