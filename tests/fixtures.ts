import { vi } from "vitest";
import { demo } from "../src/demo";
import type { Review, Specification } from "../src/domain";
import type { Gateway } from "../src/integration";
export const creator = "0x1111111111111111111111111111111111111111";
export const stranger = "0x2222222222222222222222222222222222222222";
export const spec: Specification = {
  title: "Campaign Banner Review",
  brief: demo.brief,
  artifact_url: "https://example.test/campaign.png",
  criteria: demo.criteria,
};
export function fixture(patch: Partial<Review> = {}): Review {
  return {
    ...spec,
    review_id: 1,
    creator,
    status: "EVALUATED",
    spec_hash: "a".repeat(64),
    artifact_hash: "b".repeat(64),
    matrix: demo.criteria.map((c, i) => ({
      criterion_id: c.id,
      status: i === 4 ? "PARTIAL" : "PASS",
    })),
    verdict: "ACCEPTED",
    ...patch,
  };
}
export function mockGateway(patch: Partial<Gateway> = {}): Gateway {
  return {
    configured: true,
    networkEnabled: true,
    snapshot: vi
      .fn()
      .mockResolvedValue({ available: true, address: creator, chainId: 61999 }),
    connect: vi
      .fn()
      .mockResolvedValue({ available: true, address: creator, chainId: 61999 }),
    subscribe: vi.fn(() => () => {}),
    getReview: vi.fn().mockResolvedValue(fixture()),
    getReviewCount: vi.fn().mockResolvedValue(1),
    createReview: vi.fn().mockResolvedValue(1),
    evaluate: vi.fn().mockResolvedValue(undefined),
    ...patch,
  };
}
