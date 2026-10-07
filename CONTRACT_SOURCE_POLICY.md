# CONTRACT SOURCE POLICY

## Source of Truth

Repository A:

`halihalibt/multimodal-acceptance-matrix-genlayer`

Current approved main baseline when Repository B was initialized:

`6fed5915a839b9b4336cd4723a69fd80df37fb25`

Canonical file:

`contracts/multimodal_acceptance_matrix.py`

## Repository B Requirement

Before Projects submission, Repository B must contain:

`intelligent-contract/contracts/multimodal_acceptance_matrix.py`

The file must be byte-for-byte identical to the final canonical Repository A source.

Repository B must also contain:
- source provenance
- final source commit SHA
- SHA256 of canonical source
- deployment manifest after authorized deployment

## Phase 3 Rule

Phase 3 may copy the current approved source for self-contained development/documentation, but it must clearly be treated as a synchronized copy.

If Repository A receives any authorized compatibility patch later:
1. update the Repository B copy
2. verify byte identity again
3. update provenance/hash
4. never maintain an independent fork of contract business logic

Repository B must never modify contract semantics independently.

## Final Submission Gate

Do not call Repository B self-contained until:
- final Repository A source is frozen
- B copy is byte-identical
- SHA256 is verified
- deployment manifest points to that exact source
