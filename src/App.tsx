import { useEffect, useRef, useState } from "react";
import {
  createGateway,
  type Gateway,
  type WalletSnapshot,
} from "./integration";
import {
  assignIds,
  errorMessage,
  reviewId,
  validateSpecification,
  type Criterion,
  type Review,
  type Specification,
  type TxState,
} from "./domain";
import { demo } from "./demo";
import { contractConfig, verifiedExample } from "./config";
import { pendingWrite, rememberWrite, forgetWrite, recoverCreatedReview } from "./recovery";
const defaultGateway = createGateway();
const blankCriterion = (): Criterion => ({
  id: "C1",
  text: "",
  importance: "MUST",
  assessment_mode: "BINARY",
});
const route = () => window.location.hash.slice(1).split("?")[0] || "/";
function Link({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={`#${to}`} className={className}>
      {children}
    </a>
  );
}
function Artifact({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <div className="artifact">
      {failed ? (
        <div className="image-fallback" role="status">
          Image unavailable.
          <br />
          <a href={src} target="_blank" rel="noreferrer">
            Open the artifact URL ↗
          </a>
        </div>
      ) : (
        <img src={src} alt={title} onError={() => setFailed(true)} />
      )}
    </div>
  );
}
function Criteria({
  criteria,
  matrix,
}: {
  criteria: Criterion[];
  matrix?: Review["matrix"];
}) {
  return (
    <div
      className="matrix"
      role="table"
      aria-label={matrix ? "Acceptance Matrix" : "Acceptance criteria"}
    >
      <div className="matrix-head" role="row">
        <span role="columnheader">CRITERION</span>
        <span role="columnheader">{matrix ? "RESULT" : "REQUIREMENT"}</span>
      </div>
      {criteria.map((c, i) => (
        <div role="row" className="matrix-row" key={c.id}>
          <div role="cell">
            <span className="criterion-id">{c.id}</span>
            <div>
              <strong>{c.text}</strong>
              <div className="tags">
                <span className={c.importance === "MUST" ? "must" : "should"}>
                  {c.importance}
                </span>
                <span>{c.assessment_mode}</span>
              </div>
            </div>
          </div>
          <div role="cell">
            {matrix ? (
              <span className={`cell-status ${matrix[i].status.toLowerCase()}`}>
                {matrix[i].status === "PASS"
                  ? "✓"
                  : matrix[i].status === "FAIL"
                    ? "×"
                    : matrix[i].status === "PARTIAL"
                      ? "◐"
                      : "?"}{" "}
                {matrix[i].status}
              </span>
            ) : (
              <span className="subtle">
                {c.importance === "MUST" ? "Required" : "Preferred"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
function Transaction({
  state,
  hash,
  message,
}: {
  state: TxState;
  hash?: string;
  message: string;
}) {
  if (state === "idle" && !message) return null;
  return (
    <div
      className={`transaction ${state === "failed" ? "error" : ""}`}
      role={state === "failed" ? "alert" : "status"}
    >
      <strong>
        {state === "idle"
          ? "Attention"
          : state === "complete"
            ? "Complete"
            : state === "failed"
              ? "Request failed"
              : state[0].toUpperCase() + state.slice(1)}
      </strong>
      {message && <p>{message}</p>}
      {hash && (
        <p className="hash">
          Submitted transaction: <a href={`${contractConfig.explorerUrl}/tx/${hash}`} target="_blank" rel="noreferrer">{hash} ↗</a>
          <br />
          Refresh/read before considering another write. This app never
          automatically retries writes.
        </p>
      )}
    </div>
  );
}
export function App({ gateway = defaultGateway }: { gateway?: Gateway }) {
  const [path, setPath] = useState(route),
    [wallet, setWallet] = useState<WalletSnapshot>({ available: false }),
    [walletError, setWalletError] = useState(""),
    [connecting, setConnecting] = useState(false);
  const connectLock = useRef(false);
  useEffect(() => {
    const handler = () => setPath(route());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    let active = true;
    const update = () => {
      gateway
        .snapshot()
        .then((w) => {
          if (active) {
            setWallet(w);
            setWalletError("");
          }
        })
        .catch((e) => {
          if (active) {
            setWallet({ available: true });
            setWalletError(errorMessage(e));
          }
        });
    };
    update();
    const unsub = gateway.subscribe(update);
    return () => {
      active = false;
      unsub();
    };
  }, [gateway]);
  async function connect() {
    if (connectLock.current) return;
    connectLock.current = true;
    setConnecting(true);
    setWalletError("");
    try {
      setWallet(await gateway.connect());
    } catch (e) {
      setWalletError(errorMessage(e));
    } finally {
      connectLock.current = false;
      setConnecting(false);
    }
  }
  const wrong = !!wallet.address && wallet.chainId !== 61999;
  const blocked =
    !gateway.configured || !gateway.networkEnabled || !wallet.address || wrong;
  return (
    <>
      <header>
        <Link to="/" className="wordmark">
          <span className="brand-icon">
            b<span>p</span>
          </span>
          BriefProof<span className="wordmark-note">VISUAL ACCEPTANCE</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/create">New review</Link>
          <button
            className="wallet-button"
            disabled={connecting}
            onClick={connect}
          >
            {connecting
              ? "Connecting…"
              : wallet.address
                ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`
                : "Connect wallet"}
          </button>
        </nav>
      </header>
      <div className="environment">
        <span className="dot" />{" "}
        {gateway.configured ? "Contract configured" : "Contract not configured"}
        <span className="separator">/</span>
        <span>Stable Studionet · 61999</span>
        <span className="network">
          {wallet.address
            ? wrong
              ? "Wrong or unavailable network"
              : "Stable Studionet"
            : "Wallet disconnected"}
        </span>
      </div>
      {walletError && (
        <div className="wallet-error" role="alert">
          {walletError}
        </div>
      )}
      <main>
        {path === "/" ? (
          <Home />
        ) : path === "/create" ? (
          <Create gateway={gateway} blocked={blocked} wallet={wallet} />
        ) : path.startsWith("/review/") ? (
          <Detail
            key={path}
            gateway={gateway}
            id={reviewId(path)}
            wallet={wallet}
            blocked={blocked}
          />
        ) : (
          <section className="empty">
            <h1>Page not found.</h1>
            <Link to="/">Return home →</Link>
          </section>
        )}
      </main>
      <footer>
        <span>BriefProof</span>
        <span>Clear criteria. Independent evaluation. A readable result.</span>
        <span>Phase 4 · Onchain example available</span>
      </footer>
    </>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">FROM CREATIVE BRIEF TO CLEAR DECISION</div>
        <h1>
          Did the deliverable
          <br />
          actually match
          <br />
          <span>the brief?</span>
        </h1>
        <div className="hero-bottom">
          <p>
            Turn visual acceptance criteria into a consensus-backed GenLayer
            result. Every requirement, reviewed independently. Every outcome,
            easy to read.
          </p>
          <Link to="/create" className="button primary">
            Create a review <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="workflow" aria-label="How it works">
        {[
          "Define the brief",
          "Attach the visual deliverable",
          "GenLayer validators evaluate independently",
          "Read the consensus acceptance matrix",
        ].map((s, i) => (
          <div key={s}>
            <span className="step-number">0{i + 1}</span>
            <h3>{s}</h3>
          </div>
        ))}
      </section>
      <section className="verified-section" aria-label="Verified Onchain Example">
        <div className="section-heading">
          <div><div className="eyebrow">VERIFIED ONCHAIN EXAMPLE</div>
          <h2>{verifiedExample.title}</h2></div>
          <span className="label">Review #{verifiedExample.reviewId}</span>
        </div>
        <p><strong>{verifiedExample.verdict} · {verifiedExample.summary}</strong></p>
        <p className="caption">Finalized evaluation. Open the review to read its persisted result from the contract.</p>
        <Link to="/review/1" className="button primary">Open verified Review #1 →</Link>
        <p className="hash">Contract: {contractConfig.address}</p>
        <a className="hash" href={`${contractConfig.explorerUrl}/tx/${verifiedExample.evaluationTransaction}`} target="_blank" rel="noreferrer">
          Evaluation transaction: {verifiedExample.evaluationTransaction} ↗
        </a>
      </section>
      <section className="demo-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A BRIEF IN PRACTICE</div>
            <h2>{demo.title}</h2>
          </div>
          <span className="label">Example / Demo</span>
        </div>
        <div className="demo-layout">
          <div>
            <Artifact
              src={demo.artifact}
              title="Campaign Banner Review — FORMA: Make room for better."
            />
            <p className="caption">
              Fictional brand · Committed artwork · Used by verified Review #1
            </p>
          </div>
          <div>
            <h3>One visual. Five clear criteria.</h3>
            <p className="subtle">{demo.brief}</p>
            <Criteria criteria={demo.criteria} />
            <Link to="/create?demo=campaign" className="text-link">
              Start with these criteria →
            </Link>
            <p className="caption">
              A real evaluation will determine the matrix and verdict. No result
              is prefilled.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
function Create({
  gateway,
  blocked,
  wallet,
}: {
  gateway: Gateway;
  blocked: boolean;
  wallet: WalletSnapshot;
}) {
  const useDemo = window.location.hash.includes("?demo=campaign");
  const [recovery, setRecovery] = useState(() => pendingWrite("create"));
  const [recoveryId, setRecoveryId] = useState("");
  const [spec, setSpec] = useState<Specification>({
      title: useDemo ? demo.title : "",
      brief: useDemo ? demo.brief : "",
      artifact_url: "",
      criteria: useDemo
        ? demo.criteria.map((c) => ({ ...c }))
        : [blankCriterion()],
    }),
    [errors, setErrors] = useState<string[]>([]),
    [state, setState] = useState<TxState>("idle"),
    [hash, setHash] = useState<string | undefined>(() => recovery?.hash),
    [message, setMessage] = useState(recovery ? "Previous wallet request retained. Check the transaction or wallet history and open the created review by ID. Do not resubmit." : "");
  const lock = useRef(false);
  const busy = [
    "awaiting signature",
    "submitted",
    "waiting for consensus",
  ].includes(state);
  function update(i: number, patch: Partial<Criterion>) {
    setSpec((s) => ({
      ...s,
      criteria: s.criteria.map((c, index) =>
        index === i ? { ...c, ...patch } : c,
      ),
    }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current || hash || recovery) return;
    const problems = validateSpecification(spec);
    setErrors(problems);
    if (problems.length || blocked) return;
    lock.current = true;
    setMessage("");
    try {
      const id = await gateway.createReview(spec, (s, h, reviewCountBefore) => {
        if (s === "awaiting signature") { rememberWrite("create", undefined, spec, wallet.address, reviewCountBefore); setRecovery({}); }
        setState(s);
        if (h) { setHash(h); rememberWrite("create", h); }
      });
      forgetWrite("create");
      window.location.hash = `/review/${id}`;
    } catch (e) {
      if (/4001|rejected|denied/i.test(e instanceof Error ? e.message : String(e)) && !pendingWrite("create")?.hash) {
        forgetWrite("create"); setRecovery(undefined);
      }
      setState("failed");
      setMessage(errorMessage(e));
    } finally {
      lock.current = false;
    }
  }
  return (
    <section className="create-page">
      <Link to="/" className="breadcrumb">
        ← All reviews
      </Link>
      <div className="page-intro">
        <div className="eyebrow">DEFINE WHAT GOOD LOOKS LIKE</div>
        <h1>Create a review.</h1>
        <p>Set the brief and the requirements before the evaluation begins.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <fieldset disabled={busy || !!hash || !!recovery}>
          <div className="form-section">
            <div className="form-section-title">
              <span>01</span>
              <h2>The deliverable</h2>
            </div>
            <label>
              Title
              <input
                value={spec.title}
                onChange={(e) => setSpec({ ...spec, title: e.target.value })}
                placeholder="e.g. Summer launch campaign"
              />
            </label>
            <label>
              Brief
              <textarea
                rows={4}
                value={spec.brief}
                onChange={(e) => setSpec({ ...spec, brief: e.target.value })}
                placeholder="Describe the expected visual, required wording, and restrictions."
              />
            </label>
            <label>
              Artifact URL
              <input
                aria-describedby="artifact-help"
                type="url"
                value={spec.artifact_url}
                onChange={(e) =>
                  setSpec({ ...spec, artifact_url: e.target.value })
                }
                placeholder="https://…/deliverable.png"
              />
            </label>
            <small id="artifact-help" className="field-help">
              A publicly accessible HTTPS image. PNG, JPEG or WebP, up to 2 MB.
            </small>
          </div>
          <div className="form-section">
            <div className="form-section-title">
              <span>02</span>
              <h2>Acceptance criteria</h2>
              <small>{spec.criteria.length} / 6</small>
            </div>
            <p className="subtle">
              MUST defines acceptance. SHOULD captures preferences. BINARY is
              pass/fail/unknown; GRADED also allows partial.
            </p>
            {spec.criteria.map((c, i) => (
              <div className="criterion-editor" key={i}>
                <div className="criterion-editor-top">
                  <strong>{c.id}</strong>
                  <button
                    type="button"
                    className="remove"
                    aria-label={`Remove ${c.id}`}
                    disabled={spec.criteria.length === 1}
                    onClick={() =>
                      setSpec({
                        ...spec,
                        criteria: assignIds(
                          spec.criteria.filter((_, j) => j !== i),
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <label>
                  Criterion {c.id}
                  <textarea
                    rows={2}
                    value={c.text}
                    onChange={(e) => update(i, { text: e.target.value })}
                    placeholder="A clear, observable requirement"
                  />
                </label>
                <div className="selectors">
                  <label>
                    Importance {c.id}
                    <select
                      value={c.importance}
                      onChange={(e) =>
                        update(i, {
                          importance: e.target.value as Criterion["importance"],
                        })
                      }
                    >
                      <option>MUST</option>
                      <option>SHOULD</option>
                    </select>
                  </label>
                  <label>
                    Assessment mode {c.id}
                    <select
                      value={c.assessment_mode}
                      onChange={(e) =>
                        update(i, {
                          assessment_mode: e.target
                            .value as Criterion["assessment_mode"],
                        })
                      }
                    >
                      <option>BINARY</option>
                      <option>GRADED</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
            <button
              className="button secondary"
              type="button"
              disabled={spec.criteria.length >= 6}
              onClick={() =>
                setSpec({
                  ...spec,
                  criteria: assignIds([...spec.criteria, blankCriterion()]),
                })
              }
            >
              + Add criterion
            </button>
          </div>
        </fieldset>
        {errors.length > 0 && (
          <div role="alert" className="error">
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <Transaction state={state} hash={hash} message={message} />
        {recovery && <div className="form-section">
          <label>Created review ID<input type="number" min="1" value={recoveryId} onChange={e => setRecoveryId(e.target.value)} /></label>
          {reviewId(`/review/${recoveryId}`) && <Link to={`/review/${recoveryId}`} className="text-link">Read created review for recovery →</Link>}
        </div>}
        <div className="form-submit">
          <div>
            <strong>
              {!gateway.configured
                ? "Contract not configured"
                : !wallet.address
                  ? "Connect a wallet to continue"
                  : wallet.chainId !== 61999
                    ? "Select Stable Studionet"
                    : !gateway.networkEnabled
                      ? "Network access disabled in Phase 3"
                      : "Ready for your wallet signature"}
            </strong>
            <p className="caption">
              {blocked
                ? "You can prepare your brief. Live submission becomes available after authorized network verification."
                : "The specification is immutable after creation."}
            </p>
          </div>
          <button
            className="button primary"
            disabled={blocked || busy || !!hash || !!recovery}
            type="submit"
          >
            {busy ? "Processing…" : "Create review ↗"}
          </button>
        </div>
      </form>
    </section>
  );
}
function Detail({
  gateway,
  id,
  wallet,
  blocked,
}: {
  gateway: Gateway;
  id: number | null;
  wallet: WalletSnapshot;
  blocked: boolean;
}) {
  const action = `evaluate:${id}`;
  const [recovery, setRecovery] = useState(() => pendingWrite(action));
  const [review, setReview] = useState<Review>(),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState(recovery ? "Previous wallet request retained. Refresh persisted review and check transaction or wallet history before any new write." : ""),
    [state, setState] = useState<TxState>("idle"),
    [hash, setHash] = useState<string | undefined>(() => recovery?.hash);
  const lock = useRef(false),
    active = useRef(true);
  async function load() {
    if (!id) {
      setLoading(false);
      setMessage("Invalid review ID. Use a positive whole number.");
      return;
    }
    setLoading(true);
    setMessage(recovery ? "Previous wallet request retained. Refresh/read before another write." : "");
    try {
      const r = await gateway.getReview(id);
      recoverCreatedReview(r);
      if (r.status === "EVALUATED") { forgetWrite(action); setRecovery(undefined); setMessage(""); }
      if (active.current) setReview(r);
    } catch (e) {
      if (active.current) setMessage(errorMessage(e));
    } finally {
      if (active.current) setLoading(false);
    }
  }
  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [id, gateway]);
  async function evaluate() {
    if (
      !id ||
      lock.current ||
      hash ||
      recovery ||
      blocked ||
      wallet.address?.toLowerCase() !== review?.creator.toLowerCase() ||
      review?.status !== "PENDING"
    )
      return;
    lock.current = true;
    setMessage("");
    try {
      await gateway.evaluate(id, (s, h) => {
        if (s === "awaiting signature") { rememberWrite(action); setRecovery({}); }
        if (h) rememberWrite(action, h);
        if (active.current) {
          setState(s);
          if (h) setHash(h);
        }
      });
      forgetWrite(action);
      await load();
    } catch (e) {
      if (/4001|rejected|denied/i.test(e instanceof Error ? e.message : String(e)) && !pendingWrite(action)?.hash) {
        forgetWrite(action); setRecovery(undefined);
      }
      if (active.current) {
        setState("failed");
        setMessage(errorMessage(e));
      }
    } finally {
      lock.current = false;
    }
  }
  const busy = [
    "awaiting signature",
    "submitted",
    "waiting for consensus",
  ].includes(state);
  if (loading && !review)
    return (
      <section className="empty" role="status">
        Reading review…
      </section>
    );
  if (!review)
    return (
      <section className="empty">
        <h1>Review unavailable.</h1>
        <p role="alert">{message}</p>
        <Link to="/create" className="text-link">
          Create a review →
        </Link>
        {id && gateway.configured && (
          <button className="button secondary" onClick={() => void load()}>
            Refresh review
          </button>
        )}
      </section>
    );
  return (
    <section className="detail-page">
      <Link to="/" className="breadcrumb">
        ← Home
      </Link>
      <div className="section-heading">
        <div>
          <div className="eyebrow">REVIEW #{review.review_id}</div>
          <h1>{review.title}</h1>
        </div>
        <span className="label">{review.status}</span>
      </div>
      <div className="review-layout">
        <div>
          <Artifact src={review.artifact_url} title={review.title} />
          <a
            className="caption"
            href={review.artifact_url}
            target="_blank"
            rel="noreferrer"
          >
            Open original artifact ↗
          </a>
        </div>
        <div>
          {review.status === "EVALUATED" ? (
            <>
              <div className={`verdict ${review.verdict.toLowerCase()}`}>
                <span>
                  {review.verdict === "ACCEPTED"
                    ? "✓"
                    : review.verdict === "REJECTED"
                      ? "×"
                      : review.verdict === "NEEDS_REVISION"
                        ? "↻"
                        : "?"}
                </span>
                <div>
                  <div className="eyebrow">FINAL VERDICT</div>
                  <h2>{review.verdict}</h2>
                </div>
              </div>
              <h3>Acceptance Matrix</h3>
              <Criteria criteria={review.criteria} matrix={review.matrix} />
            </>
          ) : (
            <>
              <div className="pending">
                <div className="eyebrow">READY FOR EVALUATION</div>
                <h2>
                  A clear brief.
                  <br />A result to come.
                </h2>
                <p>
                  GenLayer validators independently inspect the image against
                  every criterion. The contract persists the consensus matrix
                  and verdict.
                </p>
              </div>
              <Criteria criteria={review.criteria} />
              {wallet.address?.toLowerCase() ===
              review.creator.toLowerCase() ? (
                <button
                  className="button primary"
                  disabled={blocked || busy || !!hash || !!recovery}
                  onClick={evaluate}
                >
                  Evaluate review ↗
                </button>
              ) : (
                <p className="caption">
                  Only the creator can evaluate this review.
                </p>
              )}
            </>
          )}
          <Transaction state={state} hash={hash} message={message} />
          <button
            className="text-link refresh"
            disabled={loading || busy}
            onClick={() => void load()}
          >
            {loading ? "Reading…" : "Refresh persisted review ↻"}
          </button>
        </div>
      </div>
      <div className="review-bottom">
        <div>
          <div className="eyebrow">THE ORIGINAL BRIEF</div>
          <p className="brief-text">{review.brief}</p>
        </div>
        <details>
          <summary>Review details &amp; verification</summary>
          <dl>
            <dt>Creator</dt>
            <dd>{review.creator}</dd>
            <dt>Network</dt>
            <dd>Stable Studionet · 61999</dd>
            <dt>Contract</dt>
            <dd>
              {gateway.configured
                ? contractConfig.address
                : "Not configured · verification pending"}
            </dd>
            {review.spec_hash && (
              <>
                <dt>spec_hash</dt>
                <dd>{review.spec_hash}</dd>
              </>
            )}
            {review.artifact_hash && (
              <>
                <dt>artifact_hash</dt>
                <dd>{review.artifact_hash}</dd>
              </>
            )}
          </dl>
        </details>
      </div>
    </section>
  );
}
