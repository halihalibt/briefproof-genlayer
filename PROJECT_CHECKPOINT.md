# BriefProof measured behavior

Public application: https://halihalibt.github.io/briefproof-genlayer/ . Contract: `0xFE36de515cD28269E1347faD4f583319e9111312`, Stable Studionet 61999.

Review #1 was created and evaluated in Studio, then independently read through the client. The evaluation persisted EVALUATED / ACCEPTED and all five PASS cells with 3 AGREE / 2 DISAGREE, not unanimity. The owner separately exercised hosted OKX Wallet create/evaluate for Review #2 and confirmed persisted values after F5.

Last recorded frontend suite: 147 PASS, 0 FAIL, with TypeScript and production build passing in CI. Contract-side local evidence records 219 passing cases. Local fixture tests, SDK read-only checks and hosted wallet writes are separate measurements.

See REAL_NETWORK_EVIDENCE.md, PHASE5_PUBLIC_WEB_E2E_EVIDENCE.md and the contract deployment manifest for raw records, source binding and limits. Consensus is not guaranteed for arbitrary briefs or images; hosted wallet coverage is limited to the recorded flows.
