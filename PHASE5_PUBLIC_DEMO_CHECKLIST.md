# Phase 5 — Public Demo browser acceptance checklist

Expected site after GitHub Pages is enabled using **GitHub Actions**:

https://halihalibt.github.io/briefproof-genlayer/

## Publication gate

1. Merge Phase 5 PR into main.
2. In GitHub **Settings → Pages**, set **Build and deployment → Source → GitHub Actions**.
3. In **Actions → Publish BriefProof to GitHub Pages**, confirm build/deploy completed successfully. If the workflow was not triggered after Pages was enabled, use **Run workflow** once on main.
4. Open the public URL and confirm the visual asset loads correctly.
5. Open `#/review/1` directly; confirm live RPC-backed **EVALUATED**, **ACCEPTED**, five PASS cells, artifact hash and spec hash.
6. Refresh `#/review/1`; verify the result is reconstructed from chain reads and no write is initiated.
7. Check browser Console and Network for CORS, HTTP 429, HTTP 503, broken assets, or route errors. If reads fail due to hosted-origin CORS, STOP: do not circumvent browser security or introduce an unauthorized proxy.
8. With OKX Wallet, confirm the intended account/network connection state; **do not send create/evaluate transactions as part of this read-only smoke test**. Browser wallet writing remains unverified until separately authorized.
9. Repeat on mobile/narrow viewport where available.
10. Capture screenshots of Home, Verified Onchain Example, Review #1, and GitHub Actions successful deployment. Record public URL in submission evidence only after verification.

## Safety

- No new contract deployment, contract upgrade, faucet, chain write, or Portal submission.
- The verified example must remain honest about its 3 AGREE / 2 DISAGREE consensus.
- Keep Stable Studionet chain ID 61999 and existing canonical contract.
- This workflow only publishes static assets; there is no backend, relay, CORS proxy, paid API or secret.
- Only Phase 5 public website verification may establish browser CORS and OKX compatibility. Local JSDOM checks alone cannot.
