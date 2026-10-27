// The on-screen maths keypad. On phones and tablets it replaces the device keyboard
// (the answer box gets inputmode="none"); on computers it opens from a button and typing still works.
import { useSyncExternalStore } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Delete,
  Keyboard,
  X,
} from "lucide-react";
import type { PadKey, PadLayout } from "@/lib/maths/keypad";
import { load, save } from "@/lib/storage";
import { cn } from "@/lib/utils";

/* ---------- shared open/closed preference and touch detection ---------- */

const PREF_KEY = "numbat-keypad";
let pref: string | null | undefined;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getPref = () => {
  if (pref === undefined) pref = load(PREF_KEY);
  return pref;
};

const touchQuery = () => window.matchMedia("(pointer: coarse)");
const subscribeTouch = (fn: () => void) => {
  const m = touchQuery();
  m.addEventListener("change", fn);
  return () => m.removeEventListener("change", fn);
};

/** Whether the keypad is open. Defaults to open on touch screens and closed on computers; remembers the student's choice. */
export function useKeypad(): {
  touch: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
} {
  const touch = useSyncExternalStore(
    subscribeTouch,
    () => touchQuery().matches,
    () => false,
  );
  const p = useSyncExternalStore(subscribe, getPref, () => null);
  const open = p === null ? touch : p === "open";
  const setOpen = (o: boolean) => {
    pref = o ? "open" : "closed";
    save(PREF_KEY, pref);
    listeners.forEach((fn) => fn());
  };
  return { touch, open, setOpen };
}

/* ---------- the keypad ---------- */

export interface KeypadActions {
  insert: (text: string) => void;
  back: () => void;
  move: (dir: -1 | 1) => void;
  enter: () => void;
  close: () => void;
}

export function MathKeypad({
  layout,
  big,
  touch,
  canEnter,
  enterLabel,
  actions,
}: {
  layout: PadLayout;
  big: boolean;
  touch: boolean;
  canEnter: boolean;
  enterLabel: string;
  actions: KeypadActions;
}) {
  const symCols = Math.ceil(layout.symbols.length / 4);
  const cols = 3 + symCols;
  const extras = layout.extras.slice(0, 2);
  // keep the cursor in the answer box: pressing a key must not take focus away from it
  const hold = (e: React.MouseEvent) => e.preventDefault();

  const key = (k: PadKey, style: React.CSSProperties, cls?: string) => (
    <button
      key={k.title + k.label}
      type="button"
      className={cn("pad-key", cls)}
      style={style}
      title={k.title}
      aria-label={k.title}
      onMouseDown={hold}
      onClick={() => actions.insert(k.insert)}
    >
      {k.label}
    </button>
  );

  const digit = (d: string, col: number, row: number, span = 1) => (
    <button
      key={d}
      type="button"
      className="pad-key pad-digit"
      style={{ gridColumn: `${col} / span ${span}`, gridRow: row }}
      onMouseDown={hold}
      onClick={() => actions.insert(d)}
    >
      {d}
    </button>
  );

  return (
    <div
      className={cn("mathpad", big && "mathpad-big")}
      role="group"
      aria-label="Maths keypad"
    >
      <div
        className="pad-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d, i) =>
          digit(d, (i % 3) + 1, Math.floor(i / 3) + 1),
        )}
        {digit("0", 1, 4, 3 - extras.length)}
        {extras.map((k, i) =>
          key(k, { gridColumn: 4 - extras.length + i, gridRow: 4 }, "pad-sym"),
        )}
        {layout.symbols.map((k, i) =>
          key(
            k,
            { gridColumn: 4 + Math.floor(i / 4), gridRow: (i % 4) + 1 },
            /^[a-zA-Z]$/.test(k.label) ? "pad-letter" : "pad-sym",
          ),
        )}
      </div>
      <div className="pad-actions">
        <button
          type="button"
          className="pad-key pad-act"
          onMouseDown={hold}
          onClick={actions.close}
          title={touch ? "Use my own keyboard" : "Hide the keypad"}
          aria-label={touch ? "Use my own keyboard" : "Hide the keypad"}
        >
          {touch ? (
            <span className="pad-abc">ABC</span>
          ) : (
            <X size={big ? 22 : 18} aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="pad-key pad-act"
          onMouseDown={hold}
          onClick={() => actions.move(-1)}
          title="Move left"
          aria-label="Move left"
        >
          <ChevronLeft size={big ? 24 : 20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pad-key pad-act"
          onMouseDown={hold}
          onClick={() => actions.move(1)}
          title="Move right"
          aria-label="Move right"
        >
          <ChevronRight size={big ? 24 : 20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pad-key pad-act"
          onMouseDown={hold}
          onClick={actions.back}
          title="Delete"
          aria-label="Delete"
        >
          <Delete size={big ? 24 : 20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="pad-key pad-go"
          onMouseDown={hold}
          onClick={actions.enter}
          disabled={!canEnter}
        >
          <Check size={big ? 22 : 18} aria-hidden="true" /> {enterLabel}
        </button>
      </div>
    </div>
  );
}

/** The small button beside the answer box that opens or closes the keypad. */
export function KeypadToggle({
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
      title={open ? "Hide the maths keypad" : "Show the maths keypad"}
    >
      <Keyboard size={16} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Keypad</span>
    </button>
  );
}
