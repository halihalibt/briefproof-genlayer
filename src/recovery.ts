import { contractConfig } from "./config";
import type { Review, Specification } from "./domain";
interface PendingWrite { hash?: string; specification?: Specification; creator?: string; reviewCountBefore?: number }
const key = (action: string) => `briefproof:${contractConfig.chainId}:${contractConfig.address}:${action}`;
export function pendingWrite(action: string): PendingWrite | undefined {
  let value: string | null;
  try { value = localStorage.getItem(key(action)); } catch { return {}; }
  if (!value) return;
  try {
    const record = JSON.parse(value) as PendingWrite;
    if (record.hash && !/^0x[0-9a-f]{64}$/i.test(record.hash)) return {};
    return record;
  } catch { return {}; } // An unreadable journal never authorizes resubmission.
}
export function rememberWrite(action: string, hash?: string, specification?: Specification, creator?: string, reviewCountBefore?: number): void {
  // Persist before requesting a signature. Storage failure prevents the write.
  const previous = pendingWrite(action);
  localStorage.setItem(key(action), JSON.stringify({ ...previous,
    ...(hash ? { hash } : {}), ...(specification ? { specification, creator } : {}),
    ...(Number.isSafeInteger(reviewCountBefore) && reviewCountBefore! >= 0 ? { reviewCountBefore } : {}) }));
}
export function forgetWrite(action: string): void {
  localStorage.removeItem(key(action));
}

export function recoverCreatedReview(review: Review): void {
  const journal = pendingWrite("create");
  const spec = journal?.specification;
  // A matching historical review is NOT proof that the current create succeeded.
  // Fail closed when no valid pre-signature count or submitted hash is known.
  if (!spec || !journal?.hash ||
      !Number.isSafeInteger(journal.reviewCountBefore) ||
      journal.reviewCountBefore! < 0 ||
      review.review_id <= journal.reviewCountBefore! ||
      journal.creator?.toLowerCase() !== review.creator.toLowerCase()) return;
  if (spec.title === review.title && spec.brief === review.brief && spec.artifact_url === review.artifact_url &&
      spec.criteria.length === review.criteria.length && spec.criteria.every((c, i) => {
        const actual = review.criteria[i];
        return c.id === actual.id && c.text === actual.text && c.importance === actual.importance &&
          c.assessment_mode === actual.assessment_mode;
      })) forgetWrite("create");
}
