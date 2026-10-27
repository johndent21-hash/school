// The on-screen calculator, offered only on questions marked "Calculator allowed".
// Year 7: a basic calculator. Years 8 and up: scientific keys (√, x², xʸ, π, Ans).
// Year 9 also gets sin, cos and tan (degrees) for trigonometry.
import { useState } from "react";
import { Calculator as CalcIcon, Delete, X } from "lucide-react";
import { calcDisplay, calculate } from "@/lib/maths/calc";
import { cn } from "@/lib/utils";

// Kept between questions, like a real calculator's memory and the student's choice to have it open
let lastAns = 0;
let keepOpen = false;

type CKey = {
  label: string;
  insert?: string;
  act?: "back" | "clear" | "equals" | "second";
  title?: string;
  cls?: string;
};
const d = (n: string): CKey => ({ label: n, insert: n, cls: "pad-digit" });
const op = (label: string, insert: string, title: string): CKey => ({
  label,
  insert,
  title,
  cls: "pad-sym",
});

const BASIC: CKey[][] = [
  [
    d("7"),
    d("8"),
    d("9"),
    { label: "⌫", act: "back", title: "Delete", cls: "pad-act" },
    { label: "AC", act: "clear", title: "Clear all", cls: "pad-act" },
  ],
  [d("4"), d("5"), d("6"), op("×", "×", "times"), op("÷", "÷", "divide")],
  [d("1"), d("2"), d("3"), op("+", "+", "plus"), op("−", "−", "minus")],
  [
    d("0"),
    d("."),
    op("(", "(", "open bracket"),
    op(")", ")", "close bracket"),
    { label: "=", act: "equals", title: "Equals", cls: "pad-go" },
  ],
];
const SCI: CKey[] = [
  op("√", "√(", "square root"),
  op("x²", "²", "squared"),
  op("xʸ", "^", "to the power of"),
  op("π", "π", "pi"),
  op("Ans", "Ans", "the last answer"),
];

// Inserts that start a new calculation after "=", rather than carrying on from the last answer
const STARTS_NEW = /^[\d.(π√sct]|^Ans/;
const MULTI = [
  "sin⁻¹(",
  "cos⁻¹(",
  "tan⁻¹(",
  "sin(",
  "cos(",
  "tan(",
  "√(",
  "Ans",
  "×10^",
];

export function useCalculatorOpen(): [boolean, (open: boolean) => void] {
  const [open, setOpenState] = useState(keepOpen);
  return [
    open,
    (o: boolean) => {
      keepOpen = o;
      setOpenState(o);
    },
  ];
}

export function CalculatorToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("btn btn-ghost btn-sm pad-toggle", open && "is-open")}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      aria-pressed={open}
      title={open ? "Hide the calculator" : "Show the calculator"}
    >
      <CalcIcon size={16} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Calculator</span>
    </button>
  );
}

export function Calculator({
  year,
  onUse,
  onClose,
}: {
  year: number;
  onUse?: (text: string) => void;
  onClose: () => void;
}) {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState<
    { ok: true; value: number } | { ok: false; message: string } | null
  >(null);
  const [done, setDone] = useState(false); // just pressed "="
  const [second, setSecond] = useState(false);
  const sci = year >= 8;
  const trig = year >= 9;

  const press = (k: CKey) => {
    if (k.act === "clear") {
      setExpr("");
      setOut(null);
      setDone(false);
      return;
    }
    if (k.act === "second") {
      setSecond(!second);
      return;
    }
    if (k.act === "back") {
      if (done) {
        setDone(false);
        setOut(null);
      }
      const m = MULTI.find((t) => expr.endsWith(t));
      setExpr(expr.slice(0, expr.length - (m ? m.length : 1)));
      return;
    }
    if (k.act === "equals") {
      const r = calculate(expr, lastAns);
      setOut(r);
      if (r.ok) {
        lastAns = r.value;
        setDone(true);
      }
      return;
    }
    const ins = k.insert ?? "";
    if (done) {
      // after "=", a number starts again; an operation carries on from the answer
      setExpr(STARTS_NEW.test(ins) ? ins : "Ans" + ins);
      setDone(false);
      setOut(null);
    } else setExpr(expr + ins);
    if (second) setSecond(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, CKey> = {
      Enter: { label: "=", act: "equals" },
      "=": { label: "=", act: "equals" },
      Backspace: { label: "⌫", act: "back" },
      Escape: { label: "AC", act: "clear" },
      "*": { label: "×", insert: "×" },
      x: { label: "×", insert: "×" },
      "/": { label: "÷", insert: "÷" },
      "-": { label: "−", insert: "−" },
    };
    const k =
      map[e.key] ??
      (/^[0-9.+()^]$/.test(e.key) ? { label: e.key, insert: e.key } : null);
    if (!k) return;
    e.preventDefault();
    e.stopPropagation();
    press(k);
  };

  const trigRow: CKey[] = [
    {
      label: "2nd",
      act: "second",
      title: "Inverse functions: sin⁻¹, cos⁻¹, tan⁻¹",
      cls: cn("pad-act", second && "is-on"),
    },
    ...(["sin", "cos", "tan"] as const).map((f) =>
      op(
        second ? `${f}⁻¹` : f,
        second ? `${f}⁻¹(` : `${f}(`,
        second
          ? `inverse ${f}, answer in degrees`
          : `${f} of an angle in degrees`,
      ),
    ),
    op("×10ⁿ", "×10^", "times ten to the power"),
  ];
  const rows = [...(trig ? [trigRow] : []), ...(sci ? [SCI] : []), ...BASIC];
  const shown = out?.ok ? calcDisplay(out.value) : null;

  return (
    <div
      className="calc"
      role="group"
      aria-label="Calculator"
      onKeyDown={onKey}
    >
      <div className="calc-head">
        <span className="text-sm font-bold text-muted-foreground">
          {trig
            ? "Scientific calculator · degrees"
            : sci
              ? "Scientific calculator"
              : "Calculator"}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          aria-label="Close the calculator"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div
        className="calc-screen"
        tabIndex={0}
        aria-label="Calculator display. You can type numbers here."
      >
        <div className="calc-expr">{expr || " "}</div>
        <div
          className={cn("calc-out", out && !out.ok && "is-error")}
          aria-live="polite"
        >
          {out === null ? (
            " "
          ) : !out.ok ? (
            out.message
          ) : shown?.sci ? (
            <>
              {shown.sci.m.replace("-", "−")} × 10
              <sup>{String(shown.sci.n).replace("-", "−")}</sup>
            </>
          ) : (
            shown?.text.replace(/-/g, "−")
          )}
        </div>
      </div>
      <div className="calc-keys">
        {rows.flat().map((k, i) => (
          <button
            key={i}
            type="button"
            className={cn("pad-key", k.cls, k.label.length > 3 && "calc-small")}
            title={k.title}
            aria-label={k.title ?? k.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => press(k)}
          >
            {k.act === "back" ? (
              <Delete size={20} aria-hidden="true" />
            ) : (
              k.label
            )}
          </button>
        ))}
      </div>
      {onUse && out?.ok && shown && (
        <button
          type="button"
          className="btn btn-soft btn-sm justify-self-start"
          onClick={() => onUse(shown.text.replace(/-/g, "−"))}
        >
          Put {shown.text.replace(/-/g, "−")} in my answer box
        </button>
      )}
    </div>
  );
}
