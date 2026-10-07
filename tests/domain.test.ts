import { describe, it, expect } from "vitest";
import {
  assignIds,
  validArtifactUrl,
  validateSpecification,
  parseReview,
  reviewId,
  errorMessage,
} from "../src/domain";
import { demo } from "../src/demo";
import { fixture, spec } from "./fixtures";
describe("frozen form rules", () => {
  it("requires title", () =>
    expect(validateSpecification({ ...spec, title: " " })).toContain(
      "Enter a title.",
    ));
  it("requires brief", () =>
    expect(validateSpecification({ ...spec, brief: "" })).toContain(
      "Describe the brief.",
    ));
  it.each([
    "http://example.test/a.png",
    "https://user:password@example.test/a",
    "https://example.test/a b",
    "https://example.test:99999/a",
    "https://",
    "data:image/png,x",
  ])("rejects artifact URL %s", (value) =>
    expect(validArtifactUrl(value)).toBe(false),
  );
  it("allows a public HTTPS URL", () =>
    expect(validArtifactUrl(spec.artifact_url)).toBe(true));
  it("requires one criterion minimum", () =>
    expect(validateSpecification({ ...spec, criteria: [] })).toContain(
      "Define between 1 and 6 criteria.",
    ));
  it("caps at six criteria", () =>
    expect(
      validateSpecification({
        ...spec,
        criteria: Array(7).fill(spec.criteria[0]),
      }),
    ).toContain("Define between 1 and 6 criteria."));
  it("requires at least one MUST", () =>
    expect(
      validateSpecification({
        ...spec,
        criteria: spec.criteria.map((c) => ({ ...c, importance: "SHOULD" })),
      }),
    ).toContain("Choose at least one MUST criterion."));
  it("requires criterion text", () =>
    expect(
      validateSpecification({
        ...spec,
        criteria: [{ ...spec.criteria[0], text: " " }],
      }),
    ).toContain("Enter criterion C1 text."));
  it("preserves exact criterion text and assigns sequential IDs", () => {
    const input = spec.criteria.slice(1);
    const out = assignIds(input);
    expect(out.map((c) => c.id)).toEqual(["C1", "C2", "C3", "C4"]);
    expect(out[0].text).toBe(input[0].text);
    expect(input[0].id).toBe("C2");
  });
  it("accepts a valid form", () =>
    expect(validateSpecification(spec)).toEqual([]));
});
describe("contract readback", () => {
  it("parses exact persisted data without deriving verdict", () => {
    const r = fixture({ verdict: "REJECTED" });
    expect(parseReview(JSON.stringify(r))).toEqual(r);
  });
  it.each(["ACCEPTED", "NEEDS_REVISION", "REJECTED", "UNDETERMINED"] as const)(
    "preserves verdict %s",
    (verdict) =>
      expect(parseReview(fixture({ verdict })).verdict).toBe(verdict),
  );
  it.each(["PASS", "PARTIAL", "FAIL", "UNKNOWN"] as const)(
    "preserves graded status %s",
    (status) => {
      const r = fixture();
      r.matrix[4].status = status;
      expect(parseReview(r).matrix[4].status).toBe(status);
    },
  );
  it("rejects PARTIAL on BINARY", () => {
    const r = fixture();
    r.matrix[0].status = "PARTIAL";
    expect(() => parseReview(r)).toThrow("invalid acceptance matrix");
  });
  it("rejects unordered matrix", () => {
    const r = fixture();
    r.matrix.reverse();
    expect(() => parseReview(r)).toThrow("invalid acceptance matrix");
  });
  it("rejects invalid verdict", () =>
    expect(() => parseReview({ ...fixture(), verdict: "APPROVED" })).toThrow());
  it("rejects missing matrix cells", () =>
    expect(() => parseReview({ ...fixture(), matrix: [] })).toThrow());
  it("rejects invalid hash", () =>
    expect(() =>
      parseReview({ ...fixture(), artifact_hash: "invalid" }),
    ).toThrow());
  it("accepts PENDING without fabricating a matrix", () => {
    const r = fixture({
      status: "PENDING",
      matrix: [],
      verdict: "",
      artifact_hash: "",
    });
    expect(parseReview(r)).toEqual(r);
  });
  it.each([
    "/review/0",
    "/review/-1",
    "/review/1.1",
    "/review/abc",
    "/review/9007199254740992",
  ])("rejects invalid route %s", (p) => expect(reviewId(p)).toBeNull());
  it("parses valid detail route", () =>
    expect(reviewId("/review/42")).toBe(42));
  it("maps nonexistent review", () =>
    expect(errorMessage(new Error("EXPECTED:UNKNOWN_REVIEW"))).toContain(
      "does not exist",
    ));
  it("maps wallet rejection", () =>
    expect(errorMessage(new Error("4001"))).toContain("No automatic retry"));
  it("maps rate limit", () =>
    expect(errorMessage(new Error("HTTP 429"))).toContain("Wait"));
  it("has the exact five frozen demo criteria", () => {
    expect(demo.criteria).toEqual(spec.criteria);
    expect(demo.criteria.map((c) => c.id)).toEqual([
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
    ]);
  });
});
