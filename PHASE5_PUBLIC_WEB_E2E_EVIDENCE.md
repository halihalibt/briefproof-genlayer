# Phase 5 — Public browser write E2E evidence (Review #2)

## Scope and reliability of evidence

This records **user-performed** actions in the publicly hosted BriefProof
application, not contract calls performed by a CI runner or this documentation
patch. The user supplied screenshots from GitHub Pages and Studio Explorer.
The static application, contract and onchain evidence are independently linked
below; screenshot files from the conversation are not claimed to be committed
to this repository.

- Network: GenLayer Stable Studionet, Chain ID `61999`.
- Contract: `0xFE36de515cD28269E1347faD4f583319e9111312`.
- Public site: https://halihalibt.github.io/briefproof-genlayer/
- Public Review #2: https://halihalibt.github.io/briefproof-genlayer/#/review/2
- Wallet creator: `0x22Acaa233b7b985b36ef168F2DE9295334065B15`
  (public onchain account).
- Image: the unchanged, immutable public FORMA campaign banner used for
  previously verified Review #1.
- Review title: `BriefProof Web E2E 2026-10-09`.
- Criteria: C1–C4 MUST/BINARY; C5 SHOULD/GRADED; no mock matrix.

## Actual public-site write transactions

| Action | Transaction | Explorer-confirmed evidence |
| --- | --- | --- |
| Browser OKX Wallet `create_review` | [0x81fa89474b06785396125102300f0abdaaa9c6f32afcbe4c56f2261b05773a8c](https://explorer-studio.genlayer.com/tx/0x81fa89474b06785396125102300f0abdaaa9c6f32afcbe4c56f2261b05773a8c) | `FINALIZED`; consensus `Accepted`; GenVM `SUCCESS`; return value **2** |
| Browser OKX Wallet `evaluate(2)` | [0x57459f79cdb936b6a528fa9f79a66739ec25fcf311e672b3a00eadc85fc6c678](https://explorer-studio.genlayer.com/tx/0x57459f79cdb936b6a528fa9f79a66739ec25fcf311e672b3a00eadc85fc6c678) | `FINALIZED`; consensus `Accepted`; GenVM `SUCCESS`; return value `null` (expected for no return) |

The screenshots show **Normal** execution, **5 initial validators** and
**0 rotations** on the evaluation. Those counts do **not** establish all
five votes as AGREE; vote totals for Review #2 are **not asserted** here.

## Readback verified in the hosted browser

The user supplied a hosted BriefProof Review #2 screenshot with:

- `status = EVALUATED`
- `verdict = ACCEPTED`
- `C1 = PASS`, `C2 = PASS`, `C3 = PASS`, `C4 = PASS`, `C5 = PASS`
- Correct review title and committed image
- Immutable original brief and criteria presented alongside persisted outcome

The browser visibly renders the result from the existing contract read path;
it does not ship a hard-coded Review #2 verdict.

**Reload verification boundary:** The user refreshed while the evaluate
transaction was still pending, then later opened/read the final Review #2
screen successfully. An additional F5 refresh **after** the final EVALUATED
screen has not been separately confirmed in the supplied evidence. Do not
present that narrower after-finality refresh as already tested.

## Observed error / recovery behavior

After the browser create transaction, the site showed a failed-transaction
message even though the Explorer later confirmed FINALIZED / SUCCESS and
returned Review ID 2. The frontend then received a scoped receipt-success
compatibility patch (PR #5): `assertReceipt` recognizes both
`FINISHED_WITH_RETURN` and `SUCCESS`, while continuing to reject known
failed/unfinished executions. The exact SDK receipt object from the earlier
misleading error was **not captured**, so the error's specific cause was not
forensically proven. No duplicate create was issued.

During the evaluate transaction the user refreshed the browser before it
completed. The chain transaction nevertheless finalized successfully, and
the public review detail subsequently rendered its persisted result.
This is evidence of readback/recovery after interruption, **not** a claim
that the page showed a live uninterrupted transaction-completion transition.

## Submission value / boundaries

This complements [REAL_NETWORK_EVIDENCE.md](REAL_NETWORK_EVIDENCE.md),
which documents the original Studio-created Review #1 and independently
retrieved RPC records. Review #2 directly exercises the **public site's
wallet write → GenLayer consensus → contract persisted read** path.

Both real reviews now return an `ACCEPTED` verdict with five PASS cells.
Neither result was fabricated in the frontend. The evidence does not claim
universal support for every external wallet, provider, image codec or
adversarial prompt. The canonical Intelligent Contract remains unchanged.

This documentation patch sends **zero new transactions**, performs no
deployment or upgrade and does not submit to GenLayer Portal.
