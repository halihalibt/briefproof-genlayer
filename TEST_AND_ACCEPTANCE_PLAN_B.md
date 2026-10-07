# TEST AND ACCEPTANCE PLAN B

## Form / Input Tests

Must cover:
1. title required
2. brief required
3. HTTPS artifact URL required
4. one criterion minimum
5. six criterion maximum
6. at least one MUST
7. criterion add/remove
8. criterion IDs remain C1…Cn in order
9. importance selector
10. assessment mode selector
11. BINARY/GRADED values match contract schema

## Wallet / Transaction UI Tests

12. disconnected state
13. connected state
14. unavailable/unconfigured contract state
15. awaiting signature state
16. submitted/waiting state
17. write failure state
18. no automatic duplicate write retry
19. creator-only Evaluate action
20. non-creator cannot invoke Evaluate through UI

## Review Rendering Tests

21. PENDING review
22. EVALUATED review
23. ACCEPTED
24. NEEDS_REVISION
25. REJECTED
26. UNDETERMINED
27. PASS
28. PARTIAL
29. FAIL
30. UNKNOWN
31. artifact hash
32. spec hash
33. immutable criteria order
34. artifact image rendering/error fallback

## Navigation / Recovery

35. Home → Create
36. Create success → Review Detail
37. direct Review Detail navigation
38. reload reconstructs review from read layer
39. invalid/nonexistent Review gives useful error
40. routing remains static-host compatible

## Demo / Integrity

41. built-in Campaign Banner scenario exists
42. demo asset is local repository content
43. UI does not label demo "Verified Onchain" before real Phase 4 evidence exists
44. no hard-coded fake transaction hash
45. no hard-coded fake contract address
46. no hard-coded fake validator result presented as real

## Build Gate

- complete frontend test suite passes
- TypeScript check passes
- production build passes
- no secret required for build
- no server/backend process required
- no deployment/network transaction performed in Phase 3
