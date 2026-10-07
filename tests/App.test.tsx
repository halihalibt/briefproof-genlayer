import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { App } from "../src/App";
import { fixture, mockGateway, creator, stranger } from "./fixtures";
import type { Progress } from "../src/domain";
async function settled(g = mockGateway()) {
  render(<App gateway={g} />);
  await screen.findByRole("button", { name: /0x1111/ });
  return g;
}
async function form(g = mockGateway()) {
  window.location.hash = "/create";
  await settled(g);
  return g;
}
async function fill() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Review title" },
  });
  fireEvent.change(screen.getByLabelText("Brief"), {
    target: { value: " Exact brief with spaces. " },
  });
  fireEvent.change(screen.getByLabelText("Artifact URL"), {
    target: { value: "https://example.test/banner.png" },
  });
  fireEvent.change(screen.getByLabelText("Criterion C1"), {
    target: { value: " Brand is visible " },
  });
}
async function detail(g = mockGateway()) {
  window.location.hash = "/review/1";
  render(<App gateway={g} />);
  await screen.findByRole("heading", { name: "Campaign Banner Review" });
  return g;
}
it("renders Home and the exact four-step workflow", async () => {
  await settled();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Did the deliverable",
  );
  for (const s of [
    "Define the brief",
    "Attach the visual deliverable",
    "GenLayer validators evaluate independently",
    "Read the consensus acceptance matrix",
  ])
    expect(screen.getByText(s)).toBeVisible();
});
it("Home navigates to Create through static hash routing", async () => {
  await settled();
  expect(screen.getByRole("link", { name: /Create a review/ })).toHaveAttribute(
    "href",
    "#/create",
  );
  await act(async () => {
    window.location.hash = "/create";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(
    screen.getByRole("heading", { name: "Create a review." }),
  ).toBeVisible();
});
it("demo is labelled Example and has no fabricated chain outcome", async () => {
  await settled();
  expect(screen.getByText("Example / Demo")).toBeVisible();
  expect(screen.getByAltText(/FORMA:/)).toHaveAttribute(
    "src",
    expect.stringMatching(/campaign-banner\.png$/),
  );
  expect(screen.queryByText(/Verified Onchain/i)).not.toBeInTheDocument();
  expect(screen.queryByText("ACCEPTED")).not.toBeInTheDocument();
  expect(screen.queryByText(/0x[0-9a-f]{64}/i)).not.toBeInTheDocument();
});
it("demo starter prefills exact brief and criteria but no HTTPS URL or result", async () => {
  window.location.hash = "/create?demo=campaign";
  await settled();
  expect(screen.getByLabelText("Title")).toHaveValue("Campaign Banner Review");
  expect(screen.getByLabelText("Artifact URL")).toHaveValue("");
  expect(screen.getByLabelText("Criterion C5")).toHaveValue(
    "Composition follows a clean, premium, minimal direction",
  );
  expect(screen.getByLabelText("Assessment mode C5")).toHaveValue("GRADED");
});
it("disconnected state is clear and writes unavailable", async () => {
  window.location.hash = "/create";
  render(
    <App
      gateway={mockGateway({
        snapshot: vi.fn().mockResolvedValue({ available: true }),
      })}
    />,
  );
  expect(await screen.findByText("Wallet disconnected")).toBeVisible();
  expect(screen.getByRole("button", { name: /Create review/ })).toBeDisabled();
});
it("wallet connection is explicit", async () => {
  const g = mockGateway({
    snapshot: vi.fn().mockResolvedValue({ available: true }),
  });
  render(<App gateway={g} />);
  await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
  expect(g.connect).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole("button", { name: /0x1111/ })).toBeVisible();
});
it("unavailable wallet can surface a useful message", async () => {
  render(
    <App
      gateway={mockGateway({
        snapshot: vi.fn().mockResolvedValue({ available: false }),
        connect: vi.fn().mockRejectedValue(new Error("No wallet available.")),
      })}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Connect wallet" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No wallet available.",
  );
});
it("wrong network disables writes", async () => {
  window.location.hash = "/create";
  render(
    <App
      gateway={mockGateway({
        snapshot: vi
          .fn()
          .mockResolvedValue({ available: true, address: creator, chainId: 1 }),
      })}
    />,
  );
  expect(await screen.findByText("Wrong or unavailable network")).toBeVisible();
  expect(screen.getByRole("button", { name: /Create review/ })).toBeDisabled();
});
it("unconfigured contract is clear and form remains editable", async () => {
  await form(mockGateway({ configured: false, networkEnabled: false }));
  expect(screen.getAllByText("Contract not configured").length).toBeGreaterThan(
    0,
  );
  expect(screen.getByLabelText("Brief")).toBeEnabled();
  expect(screen.getByRole("button", { name: /Create review/ })).toBeDisabled();
});
it("renders connected wallet and Stable Studionet", async () => {
  await settled();
  expect(screen.getByText("Stable Studionet")).toBeVisible();
});
it("validates required fields with useful messages", async () => {
  const g = await form();
  await userEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a title.");
  expect(screen.getByRole("alert")).toHaveTextContent("Describe the brief.");
  expect(screen.getByRole("alert")).toHaveTextContent("HTTPS");
  expect(g.createReview).not.toHaveBeenCalled();
});
it("requires a MUST criterion", async () => {
  const g = await form();
  await fill();
  await userEvent.selectOptions(
    screen.getByLabelText("Importance C1"),
    "SHOULD",
  );
  await userEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("at least one MUST");
  expect(g.createReview).not.toHaveBeenCalled();
});
it("prevents removal of last criterion", async () => {
  await form();
  expect(screen.getByRole("button", { name: "Remove C1" })).toBeDisabled();
});
it("adds, removes and renumbers criterion IDs", async () => {
  await form();
  await userEvent.click(
    screen.getByRole("button", { name: "+ Add criterion" }),
  );
  fireEvent.change(screen.getByLabelText("Criterion C2"), {
    target: { value: "Second" },
  });
  await userEvent.click(screen.getByRole("button", { name: "Remove C1" }));
  expect(screen.getByLabelText("Criterion C1")).toHaveValue("Second");
  expect(screen.queryByLabelText("Criterion C2")).not.toBeInTheDocument();
});
it("caps criterion editor at six rows", async () => {
  await form();
  for (let i = 0; i < 5; i++)
    await userEvent.click(
      screen.getByRole("button", { name: "+ Add criterion" }),
    );
  expect(
    screen.getByRole("button", { name: "+ Add criterion" }),
  ).toBeDisabled();
  expect(screen.getByLabelText("Criterion C6")).toBeVisible();
  expect(screen.queryByLabelText("Criterion C7")).not.toBeInTheDocument();
});
it("submits exact input text and selector values, then navigates to detail", async () => {
  const g = await form();
  await fill();
  await userEvent.selectOptions(
    screen.getByLabelText("Assessment mode C1"),
    "GRADED",
  );
  await userEvent.click(screen.getByRole("button", { name: /Create review/ }));
  await waitFor(() => expect(window.location.hash).toBe("#/review/1"));
  expect(g.createReview).toHaveBeenCalledWith(
    expect.objectContaining({
      brief: " Exact brief with spaces. ",
      criteria: [
        {
          id: "C1",
          text: " Brand is visible ",
          importance: "MUST",
          assessment_mode: "GRADED",
        },
      ],
    }),
    expect.any(Function),
  );
});
it("shows awaiting signature and prevents duplicate clicks", async () => {
  const g = await form(
    mockGateway({
      createReview: vi.fn().mockImplementation((_spec, progress: Progress) => {
        progress("awaiting signature");
        return new Promise(() => {});
      }),
    }),
  );
  await fill();
  fireEvent.click(screen.getByRole("button", { name: /Create review/ }));
  fireEvent.click(screen.getByRole("button", { name: "Processing…" }));
  expect(screen.getByRole("status")).toHaveTextContent("Awaiting signature");
  expect(g.createReview).toHaveBeenCalledTimes(1);
});
it("shows submitted state without invented validator votes", async () => {
  await form(
    mockGateway({
      createReview: vi.fn().mockImplementation((_spec, progress: Progress) => {
        progress("submitted", `0x${"a".repeat(64)}`);
        return new Promise(() => {});
      }),
    }),
  );
  await fill();
  fireEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(screen.getByRole("status")).toHaveTextContent("Submitted");
  expect(screen.queryByText(/validators agree/i)).not.toBeInTheDocument();
});
it("shows waiting for consensus", async () => {
  await form(
    mockGateway({
      createReview: vi.fn().mockImplementation((_spec, progress: Progress) => {
        progress("waiting for consensus");
        return new Promise(() => {});
      }),
    }),
  );
  await fill();
  fireEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(screen.getByRole("status")).toHaveTextContent("Waiting for consensus");
});
it("failure is visible without any automatic write retry", async () => {
  const g = await form(
    mockGateway({
      createReview: vi.fn().mockRejectedValue(new Error("Wallet declined.")),
    }),
  );
  await fill();
  await userEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Request failed");
  expect(g.createReview).toHaveBeenCalledTimes(1);
});
it("locks a submitted create after timeout and retains transaction ID", async () => {
  const hash = `0x${"a".repeat(64)}`;
  const g = await form(
    mockGateway({
      createReview: vi
        .fn()
        .mockImplementation(async (_spec, progress: Progress) => {
          progress("submitted", hash);
          throw new Error("timeout");
        }),
    }),
  );
  await fill();
  await userEvent.click(screen.getByRole("button", { name: /Create review/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent(hash);
  expect(screen.getByRole("button", { name: /Create review/ })).toBeDisabled();
  expect(g.createReview).toHaveBeenCalledTimes(1);
});
it("PENDING has criteria, brief, creator, spec_hash and no matrix/verdict", async () => {
  await detail(
    mockGateway({
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
    }),
  );
  expect(screen.getByText("PENDING")).toBeVisible();
  expect(
    screen.queryByRole("table", { name: "Acceptance Matrix" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText("FINAL VERDICT")).not.toBeInTheDocument();
  await userEvent.click(screen.getByText("Review details & verification"));
  expect(screen.getByText("a".repeat(64))).toBeVisible();
  expect(screen.getByText(creator)).toBeVisible();
});
it("creator can see Evaluate on PENDING", async () => {
  await detail(
    mockGateway({
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
    }),
  );
  expect(
    await screen.findByRole("button", { name: /Evaluate review/ }),
  ).toBeEnabled();
});
it("non-creator cannot invoke Evaluate through UI", async () => {
  await detail(
    mockGateway({
      snapshot: vi
        .fn()
        .mockResolvedValue({
          available: true,
          address: stranger,
          chainId: 61999,
        }),
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
    }),
  );
  expect(
    screen.queryByRole("button", { name: /Evaluate review/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText("Only the creator can evaluate this review."),
  ).toBeVisible();
});
it("case-insensitive creator address comparison", async () => {
  await detail(
    mockGateway({
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            creator: creator.toUpperCase().replace("0X", "0x"),
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
    }),
  );
  expect(
    await screen.findByRole("button", { name: /Evaluate review/ }),
  ).toBeEnabled();
});
it.each(["ACCEPTED", "NEEDS_REVISION", "REJECTED", "UNDETERMINED"] as const)(
  "faithfully renders persisted verdict %s",
  async (verdict) => {
    await detail(
      mockGateway({
        getReview: vi.fn().mockResolvedValue(fixture({ verdict })),
      }),
    );
    expect(screen.getByRole("heading", { name: verdict })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /Evaluate review/ }),
    ).not.toBeInTheDocument();
  },
);
it.each(["PASS", "PARTIAL", "FAIL", "UNKNOWN"] as const)(
  "renders matrix status %s with text",
  async (status) => {
    const r = fixture();
    r.matrix[4].status = status;
    await detail(mockGateway({ getReview: vi.fn().mockResolvedValue(r) }));
    expect(
      within(
        screen.getByRole("table", { name: "Acceptance Matrix" }),
      ).getAllByText(new RegExp(status)).length,
    ).toBeGreaterThan(0);
  },
);
it("matrix preserves immutable criteria order", async () => {
  await detail();
  const rows = within(screen.getByRole("table", { name: "Acceptance Matrix" }))
    .getAllByRole("row")
    .slice(1);
  expect(rows.map((r) => r.textContent?.slice(0, 2))).toEqual([
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
  ]);
});
it("EVALUATED shows artifact/spec hashes", async () => {
  await detail();
  await userEvent.click(screen.getByText("Review details & verification"));
  expect(screen.getByText("a".repeat(64))).toBeVisible();
  expect(screen.getByText("b".repeat(64))).toBeVisible();
});
it("artifact uses title-derived alt and offers an error fallback", async () => {
  await detail();
  const image = screen.getByAltText("Campaign Banner Review");
  expect(image).toHaveAttribute("src", "https://example.test/campaign.png");
  fireEvent.error(image);
  expect(screen.getByText("Image unavailable.")).toBeVisible();
  expect(
    screen.getByRole("link", { name: /Open the artifact URL/ }),
  ).toHaveAttribute("href", "https://example.test/campaign.png");
});
it("direct navigation reads contract and remount reconstructs persisted review", async () => {
  window.location.hash = "/review/1";
  const g = mockGateway();
  const { unmount } = render(<App gateway={g} />);
  await screen.findByRole("heading", { name: "ACCEPTED" });
  unmount();
  render(<App gateway={g} />);
  await screen.findByRole("heading", { name: "ACCEPTED" });
  expect(g.getReview).toHaveBeenCalledTimes(2);
  expect(g.createReview).not.toHaveBeenCalled();
  expect(g.evaluate).not.toHaveBeenCalled();
});
it("invalid review route gives useful message without read", async () => {
  window.location.hash = "/review/0";
  const g = mockGateway();
  render(<App gateway={g} />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Invalid review ID",
  );
  expect(g.getReview).not.toHaveBeenCalled();
});
it("nonexistent review gives useful error", async () => {
  window.location.hash = "/review/999";
  render(
    <App
      gateway={mockGateway({
        getReview: vi
          .fn()
          .mockRejectedValue(new Error("EXPECTED:UNKNOWN_REVIEW")),
      })}
    />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("does not exist");
});
it("unconfigured direct navigation explains why read is unavailable", async () => {
  window.location.hash = "/review/1";
  render(
    <App
      gateway={mockGateway({
        configured: false,
        networkEnabled: false,
        getReview: vi
          .fn()
          .mockRejectedValue(
            new Error(
              "Contract not configured. Real network verification is pending.",
            ),
          ),
      })}
    />,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("not configured");
});
it("evaluate completion re-reads and renders persisted matrix", async () => {
  const getReview = vi
    .fn()
    .mockResolvedValueOnce(
      fixture({
        status: "PENDING",
        matrix: [],
        verdict: "",
        artifact_hash: "",
      }),
    )
    .mockResolvedValue(fixture());
  const g = await detail(
    mockGateway({
      getReview,
      evaluate: vi
        .fn()
        .mockImplementation(async (_id, progress: Progress) =>
          progress("complete"),
        ),
    }),
  );
  await userEvent.click(
    await screen.findByRole("button", { name: /Evaluate review/ }),
  );
  expect(
    await screen.findByRole("heading", { name: "ACCEPTED" }),
  ).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("Complete");
  expect(g.evaluate).toHaveBeenCalledTimes(1);
  expect(getReview).toHaveBeenCalledTimes(2);
});
it("evaluate timeout keeps hash and blocks duplicate write but permits refresh", async () => {
  const g = await detail(
    mockGateway({
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
      evaluate: vi.fn().mockImplementation(async (_id, progress: Progress) => {
        progress("submitted", `0x${"a".repeat(64)}`);
        throw new Error("timeout");
      }),
    }),
  );
  await userEvent.click(
    await screen.findByRole("button", { name: /Evaluate review/ }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("timeout");
  expect(
    screen.getByRole("button", { name: /Evaluate review/ }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /Refresh persisted/ }),
  ).toBeEnabled();
  expect(g.evaluate).toHaveBeenCalledTimes(1);
});
it("refresh is explicit and does not write", async () => {
  const g = await detail();
  await userEvent.click(
    screen.getByRole("button", { name: /Refresh persisted/ }),
  );
  await waitFor(() => expect(g.getReview).toHaveBeenCalledTimes(2));
  expect(g.evaluate).not.toHaveBeenCalled();
});
it("wallet change subscription updates creator-only controls", async () => {
  let update = () => {};
  const snapshot = vi
    .fn()
    .mockResolvedValue({ available: true, address: creator, chainId: 61999 });
  const g = await detail(
    mockGateway({
      snapshot,
      subscribe: (fn) => {
        update = fn;
        return () => {};
      },
      getReview: vi
        .fn()
        .mockResolvedValue(
          fixture({
            status: "PENDING",
            matrix: [],
            verdict: "",
            artifact_hash: "",
          }),
        ),
    }),
  );
  expect(
    await screen.findByRole("button", { name: /Evaluate review/ }),
  ).toBeVisible();
  snapshot.mockResolvedValue({
    available: true,
    address: stranger,
    chainId: 61999,
  });
  await act(async () => update());
  expect(
    screen.queryByRole("button", { name: /Evaluate review/ }),
  ).not.toBeInTheDocument();
  expect(g.evaluate).not.toHaveBeenCalled();
});
