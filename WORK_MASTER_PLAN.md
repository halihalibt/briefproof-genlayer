# BriefProof client architecture

BriefProof is a static Vite, React and TypeScript client for Multimodal Acceptance Matrix. A creator enters a brief, public image URL and 1–6 criteria, signs create_review, opens the returned review and explicitly requests evaluation. The client renders the persisted matrix and verdict after finality and successful readback.

The browser uses genlayer-js and explicit wallet actions. It does not replace contract decisions, infer review IDs from a global count, automatically resend transactions or supply simulated results to the production path. Routes support static hosting and reload reconstruction.

The complete contract copy and its source binding are documented in CONTRACT_SOURCE_POLICY.md. Local component tests, real SDK reads and hosted wallet execution have distinct evidence scopes; see REAL_NETWORK_EVIDENCE.md and PHASE5_PUBLIC_WEB_E2E_EVIDENCE.md.
