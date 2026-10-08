// Opt-in live verification: actual SDK/RPC, mounted React, no injected mock data.
import "@testing-library/jest-dom/vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { writeFileSync } from "node:fs";
import { App } from "../src/App";
import { createGateway } from "../src/integration";
import { demo } from "../src/demo";
import { contractConfig } from "../src/config";
it("reads real persisted Review #1 and reconstructs React after reload with no wallet", async () => {
  const nativeFetch = globalThis.fetch;
  const methods: string[] = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) !== contractConfig.rpcUrl) throw new Error("Unexpected endpoint");
    const body = JSON.parse(init?.body as string);
    if (body.method !== "gen_call" || body.params[0].type !== "read") throw new Error("Non-read RPC blocked");
    methods.push(body.method);
    return nativeFetch(input, init);
  });
  const gateway = createGateway({ provider: () => undefined });
  const count = await gateway.getReviewCount();
  expect(count).toBeGreaterThanOrEqual(1);
  const review = await gateway.getReview(1);
  expect(review).toMatchObject({review_id:1,status:"EVALUATED",verdict:"ACCEPTED",
    artifact_hash:"7ad41f531eaa6391a3ac53e6f77de328e9d9087bd321904756e4d89977d5d378",
    spec_hash:"5d704bb43b083972a40cb8b8ff8e55d49c0739afdd1eb421f894e260a418165d",
    brief:demo.brief,criteria:demo.criteria});
  expect(review.matrix).toEqual(demo.criteria.map(c=>({criterion_id:c.id,status:"PASS"})));
  window.location.hash = "/review/1";
  const first = render(<App gateway={gateway} />);
  await screen.findByRole("heading", {name:"ACCEPTED"}, {timeout:60000});
  expect(within(screen.getByRole("table",{name:"Acceptance Matrix"})).getAllByText(/✓ PASS/)).toHaveLength(5);
  first.unmount();
  render(<App gateway={createGateway({provider:()=>undefined})} />);
  await screen.findByRole("heading", {name:"ACCEPTED"}, {timeout:60000});
  expect(within(screen.getByRole("table",{name:"Acceptance Matrix"})).getAllByText(/✓ PASS/)).toHaveLength(5);
  expect(methods).toHaveLength(4);
  writeFileSync("verification/readonly-result.json",JSON.stringify({verifiedAt:new Date().toISOString(),count,
    sdk:"genlayer-js 1.1.8",rpc:contractConfig.rpcUrl,wallet:false,review,
    reactFirstMount:true,reactReloadReconstruction:true,environment:"JSDOM, actual native fetch and SDK; not full Chromium",methods,newTransactions:0},null,2)+"\n");
  cleanup(); vi.unstubAllGlobals();
});
