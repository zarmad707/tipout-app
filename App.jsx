import { useState, useEffect } from "react";

const HISTORY_KEY = "tipout:history";

const fmt = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val || 0);

const parse = (str) => {
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
};

function SalesCard({ label, hint, value, onChange, color, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        background: "#1c1c1c", border: "1px solid #2a2a2a",
        borderRadius: 12, padding: "18px 20px",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#666", marginBottom: 10,
        }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: color, fontSize: 20, lineHeight: 1 }}>$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#f0ece2", fontSize: 30, fontWeight: 300, caretColor: color,
            }}
          />
        </div>
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid #252525",
          fontSize: 11, color: "#4a4a4a",
        }}>
          {hint}
        </div>
      </div>
      {children}
    </div>
  );
}

function Stepper({ label, value, onChange, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#141414", border: "1px solid #252525",
      borderRadius: "0 0 10px 10px", marginTop: -2,
      padding: "10px 20px",
    }}>
      <span style={{ color: "#555", fontSize: 11, fontWeight: 500 }}>
        # of {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => onChange(Math.max(1, value - 1))} style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "1px solid #333", background: "transparent",
          color: color, fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>−</button>
        <span style={{ color: "#f0ece2", fontSize: 18, fontWeight: 400, minWidth: 22, textAlign: "center" }}>
          {value}
        </span>
        <button onClick={() => onChange(value + 1)} style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "1px solid #333", background: "transparent",
          color: color, fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      </div>
    </div>
  );
}

function Row({ label, sub, amount, color, splitAmt, splitLabel }) {
  return (
    <div style={{ borderBottom: "1px solid #1e1e1e" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 20px",
      }}>
        <div>
          <div style={{ color: "#bbb", fontSize: 13, fontWeight: 500 }}>{label}</div>
          <div style={{ color: "#4a4a4a", fontSize: 11, marginTop: 3 }}>{sub}</div>
        </div>
        <div style={{ color: color, fontSize: 22, fontWeight: 500 }}>{fmt(amount)}</div>
      </div>
      {splitAmt > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "7px 20px 13px",
          background: "#111", borderTop: "1px solid #1a1a1a",
        }}>
          <span style={{ color: "#3a3a3a", fontSize: 11 }}>{splitLabel}</span>
          <span style={{ color: color, fontSize: 13, fontWeight: 600, opacity: 0.75 }}>
            {fmt(splitAmt)} each
          </span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [foodSales, setFoodSales] = useState("");
  const [barSales, setBarSales] = useState("");
  const [sushiSales, setSushiSales] = useState("");
  const [numUtility, setNumUtility] = useState(1);
  const [numBartenders, setNumBartenders] = useState(1);

  const [history, setHistory] = useState([]);
  const [view, setView] = useState("calc"); // "calc" | "history"
  const [loaded, setLoaded] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load saved history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      // no history yet
    }
    setLoaded(true);
  }, []);

  const persist = (next) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const food = parse(foodSales);
  const bar = parse(barSales);
  const sushi = parse(sushiSales);

  const utilityPool = food * 0.015;
  const barPool = bar * 0.05;
  const sushiPool = sushi * 0.035;
  const total = utilityPool + barPool + sushiPool;

  const utilityEach = numUtility > 0 ? utilityPool / numUtility : 0;
  const barEach = numBartenders > 0 ? barPool / numBartenders : 0;

  const hasData = food > 0 || bar > 0 || sushi > 0;

  const saveNight = () => {
    if (!hasData) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      food, bar, sushi,
      numUtility, numBartenders,
      utilityPool, barPool, sushiPool, total,
      utilityEach, barEach,
    };
    persist([entry, ...history]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const deleteEntry = (id) => {
    persist(history.filter((h) => h.id !== id));
  };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block", background: "#c8a55b", color: "#0d0d0d",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.18em",
            textTransform: "uppercase", padding: "4px 12px", borderRadius: 2, marginBottom: 12,
          }}>
            End of Night
          </div>
          <h1 style={{
            color: "#f0ece2", fontSize: 28, fontWeight: 300,
            margin: 0, letterSpacing: "-0.02em",
          }}>
            Tip Out Calculator
          </h1>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 20,
          background: "#151515", border: "1px solid #2a2a2a",
          borderRadius: 10, padding: 4,
        }}>
          {[
            { key: "calc", label: "Calculator" },
            { key: "history", label: "History" + (history.length ? " (" + history.length + ")" : "") },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              style={{
                flex: 1, padding: "9px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
                background: view === t.key ? "#c8a55b" : "transparent",
                color: view === t.key ? "#0d0d0d" : "#777",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {view === "calc" && (<>
        {/* Food */}
        <SalesCard
          label="Total Food Sales"
          hint="Utility tip-out: 1.5% of food sales"
          value={foodSales}
          onChange={setFoodSales}
          color="#c8a55b"
        >
          <Stepper label="Utility Workers" value={numUtility} onChange={setNumUtility} color="#c8a55b" />
        </SalesCard>

        {/* Bar */}
        <SalesCard
          label="Total Bar Sales"
          hint="Bar tip-out: 5% of bar sales"
          value={barSales}
          onChange={setBarSales}
          color="#4a9eff"
        >
          <Stepper label="Bartenders" value={numBartenders} onChange={setNumBartenders} color="#4a9eff" />
        </SalesCard>

        {/* Sushi */}
        <SalesCard
          label="Total Sushi Sales"
          hint="Sushi tip-out: 3.5% of sushi sales"
          value={sushiSales}
          onChange={setSushiSales}
          color="#a78bfa"
        />

        {/* Results */}
        <div style={{
          background: "#151515", border: "1px solid #2a2a2a",
          borderRadius: 12, overflow: "hidden", marginTop: 4,
        }}>
          <Row
            label="Utility Workers"
            sub={"1.5% of " + fmt(food) + "  ·  " + numUtility + " worker" + (numUtility !== 1 ? "s" : "")}
            amount={utilityPool}
            color="#c8a55b"
            splitAmt={utilityEach}
            splitLabel={"Split " + numUtility + " way" + (numUtility !== 1 ? "s" : "")}
          />
          <Row
            label="Bar"
            sub={"5% of " + fmt(bar) + "  ·  " + numBartenders + " bartender" + (numBartenders !== 1 ? "s" : "")}
            amount={barPool}
            color="#4a9eff"
            splitAmt={barEach}
            splitLabel={"Split " + numBartenders + " way" + (numBartenders !== 1 ? "s" : "")}
          />
          <Row
            label="Sushi"
            sub={"3.5% of " + fmt(sushi)}
            amount={sushiPool}
            color="#a78bfa"
            splitAmt={0}
            splitLabel=""
          />

          {/* Total */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "18px 20px", background: "#1c1c1c", borderTop: "1px solid #2a2a2a",
          }}>
            <span style={{
              color: "#f0ece2", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              Total Tip Out
            </span>
            <span style={{ color: "#f0ece2", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {fmt(total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={saveNight}
            disabled={!hasData}
            style={{
              flex: 2, padding: "13px", borderRadius: 8, border: "none",
              cursor: hasData ? "pointer" : "default",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              background: justSaved ? "#3a7d44" : (hasData ? "#c8a55b" : "#1c1c1c"),
              color: justSaved ? "#fff" : (hasData ? "#0d0d0d" : "#444"),
              transition: "background 0.2s",
            }}
          >
            {justSaved ? "Saved ✓" : "Save Night"}
          </button>
          {hasData && (
            <button
              onClick={() => {
                setFoodSales(""); setBarSales(""); setSushiSales("");
                setNumUtility(1); setNumBartenders(1);
              }}
              style={{
                flex: 1, padding: "13px", borderRadius: 8,
                background: "transparent", border: "1px solid #252525",
                color: "#555", fontSize: 12, cursor: "pointer",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              Clear
            </button>
          )}
        </div>
        </>)}

        {view === "history" && (
          <div>
            {!loaded && (
              <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: 13 }}>
                Loading…
              </div>
            )}
            {loaded && history.length === 0 && (
              <div style={{
                textAlign: "center", color: "#555", padding: "48px 24px",
                background: "#151515", border: "1px dashed #2a2a2a", borderRadius: 12,
              }}>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>No saved nights yet</div>
                <div style={{ fontSize: 12 }}>Enter your sales, then tap Save Night to log a shift.</div>
              </div>
            )}
            {loaded && history.map((h) => (
              <div key={h.id} style={{
                background: "#151515", border: "1px solid #2a2a2a",
                borderRadius: 12, padding: "16px 18px", marginBottom: 12,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 12,
                }}>
                  <span style={{ color: "#aaa", fontSize: 12, fontWeight: 500 }}>{fmtDate(h.date)}</span>
                  <button
                    onClick={() => deleteEntry(h.id)}
                    style={{
                      background: "transparent", border: "none", color: "#4a4a4a",
                      fontSize: 11, cursor: "pointer", letterSpacing: "0.04em",
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <HistLine color="#c8a55b" label={"Utility (" + h.numUtility + ")"} amount={h.utilityPool} each={h.utilityEach} />
                  <HistLine color="#4a9eff" label={"Bar (" + h.numBartenders + ")"} amount={h.barPool} each={h.barEach} />
                  <HistLine color="#a78bfa" label="Sushi" amount={h.sushiPool} each={0} />
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: 12, paddingTop: 12, borderTop: "1px solid #252525",
                }}>
                  <span style={{ color: "#888", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Total
                  </span>
                  <span style={{ color: "#f0ece2", fontSize: 18, fontWeight: 600 }}>{fmt(h.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function HistLine({ color, label, amount, each }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#888", fontSize: 12, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
        {label}
      </span>
      <span style={{ color: "#ccc", fontSize: 13 }}>
        {fmt(amount)}
        {each > 0 && <span style={{ color: "#555", fontSize: 11 }}> · {fmt(each)} ea</span>}
      </span>
    </div>
  );
}
