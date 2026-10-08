// genlayer-js 1.1.8's transport parses JSON without checking HTTP status.
// Preserve HTTP errors before the SDK loses 429/Retry-After information.
// This one-time guard affects only the authorized RPC URL; successful responses
// and every other fetch are passed through unchanged. No request is retried.
const guarded = new WeakSet<typeof fetch>();
export function installRpcHttpGuard(endpoint: string): void {
  if (guarded.has(globalThis.fetch)) return;
  const nativeFetch = globalThis.fetch.bind(globalThis);
  let blockedUntil = 0;
  const wrapper: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url !== endpoint) return nativeFetch(input, init);
    if (Date.now() < blockedUntil)
      throw Object.assign(new Error("HTTP 429: RPC cooldown active. Wait before refreshing."), { status: 429 });
    const response = await nativeFetch(input, init);
    if (!response.ok) {
      const header = response.headers.get("Retry-After");
      const seconds = header && /^\d+(\.\d+)?$/.test(header) ? Number(header)
        : header ? Math.max(0, (Date.parse(header) - Date.now()) / 1000) : 0;
      const retryAfter = Math.max(60, Number.isFinite(seconds) ? seconds : 0);
      if (response.status === 429) blockedUntil = Date.now() + retryAfter * 1000;
      throw Object.assign(new Error(`HTTP ${response.status}: RPC request failed. No automatic retry was made.`),
        { status: response.status, retryAfter });
    }
    return response;
  };
  guarded.add(wrapper);
  globalThis.fetch = wrapper;
}
