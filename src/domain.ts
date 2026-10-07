export type Importance = "MUST" | "SHOULD";
export type AssessmentMode = "BINARY" | "GRADED";
export type CellStatus = "PASS" | "PARTIAL" | "FAIL" | "UNKNOWN";
export type Verdict =
  "ACCEPTED" | "NEEDS_REVISION" | "REJECTED" | "UNDETERMINED";
export interface Criterion {
  id: string;
  text: string;
  importance: Importance;
  assessment_mode: AssessmentMode;
}
export interface Specification {
  title: string;
  brief: string;
  artifact_url: string;
  criteria: Criterion[];
}
export interface Review extends Specification {
  review_id: number;
  creator: string;
  status: "PENDING" | "EVALUATED";
  spec_hash: string;
  artifact_hash: string;
  matrix: { criterion_id: string; status: CellStatus }[];
  verdict: Verdict | "";
}
export type TxState =
  | "idle"
  | "awaiting signature"
  | "submitted"
  | "waiting for consensus"
  | "failed"
  | "complete";
export type Progress = (state: TxState, hash?: string) => void;
export function assignIds(criteria: Criterion[]): Criterion[] {
  return criteria.map((c, i) => ({ ...c, id: `C${i + 1}` }));
}
export function validArtifactUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      value.startsWith("https://") &&
      u.protocol === "https:" &&
      !!u.hostname &&
      !u.username &&
      !u.password &&
      !/[\s\x00-\x1f]/.test(value)
    );
  } catch {
    return false;
  }
}
export function validateSpecification(spec: Specification): string[] {
  const errors: string[] = [];
  if (!spec.title.trim()) errors.push("Enter a title.");
  if (!spec.brief.trim()) errors.push("Describe the brief.");
  if (!validArtifactUrl(spec.artifact_url))
    errors.push("Use a public HTTPS image URL without credentials or spaces.");
  if (spec.criteria.length < 1 || spec.criteria.length > 6)
    errors.push("Define between 1 and 6 criteria.");
  if (!spec.criteria.some((c) => c.importance === "MUST"))
    errors.push("Choose at least one MUST criterion.");
  spec.criteria.forEach((c, i) => {
    if (!c.text.trim()) errors.push(`Enter criterion C${i + 1} text.`);
  });
  return errors;
}
// Validate persisted data; never derive a verdict or manufacture missing results.
export function parseReview(value: unknown): Review {
  const r = typeof value === "string" ? JSON.parse(value) : value;
  if (!r || typeof r !== "object")
    throw new Error("The contract returned an invalid review.");
  const v = r as Review;
  if (
    !Number.isSafeInteger(v.review_id) ||
    v.review_id < 1 ||
    typeof v.creator !== "string" ||
    !/^0x[0-9a-f]{40}$/i.test(v.creator) ||
    typeof v.title !== "string" ||
    typeof v.brief !== "string" ||
    typeof v.artifact_url !== "string" ||
    !Array.isArray(v.criteria) ||
    typeof v.spec_hash !== "string" ||
    typeof v.artifact_hash !== "string"
  )
    throw new Error("The contract returned an invalid review.");
  if (
    validateSpecification(v).length ||
    v.criteria.some(
      (c, i) =>
        c.id !== `C${i + 1}` ||
        !["MUST", "SHOULD"].includes(c.importance) ||
        !["BINARY", "GRADED"].includes(c.assessment_mode),
    )
  )
    throw new Error("The contract returned invalid criteria.");
  if (!["PENDING", "EVALUATED"].includes(v.status) || !Array.isArray(v.matrix))
    throw new Error("The contract returned an invalid status.");
  if (
    v.status === "EVALUATED" &&
    (!["ACCEPTED", "NEEDS_REVISION", "REJECTED", "UNDETERMINED"].includes(
      v.verdict,
    ) ||
      v.matrix.length !== v.criteria.length ||
      v.matrix.some(
        (cell, i) =>
          cell.criterion_id !== v.criteria[i].id ||
          !["PASS", "PARTIAL", "FAIL", "UNKNOWN"].includes(cell.status) ||
          (cell.status === "PARTIAL" &&
            v.criteria[i].assessment_mode === "BINARY"),
      ) ||
      !/^[0-9a-f]{64}$/.test(v.artifact_hash) ||
      !/^[0-9a-f]{64}$/.test(v.spec_hash))
  )
    throw new Error("The contract returned an invalid acceptance matrix.");
  return v;
}
export function reviewId(path: string): number | null {
  const m = /^\/review\/([1-9]\d*)$/.exec(path);
  const id = m ? Number(m[1]) : NaN;
  return Number.isSafeInteger(id) ? id : null;
}
export function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/UNKNOWN_REVIEW/.test(message))
    return "This review does not exist. Check the review ID.";
  if (/4001|rejected|denied/i.test(message))
    return "Wallet request declined. No automatic retry was made.";
  if (/429/.test(message))
    return "Too many requests. Wait before refreshing the review.";
  return (
    message || "The request failed. Check your wallet and try again manually."
  );
}
