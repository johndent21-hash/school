// The answer area under a question: a text box with the maths keypad, or multiple-choice buttons.
import { useEffect, useRef } from "react";
import type { Answer, Question } from "@/lib/maths/types";
import { padLayout } from "@/lib/maths/keypad";
import { ex } from "@/lib/maths/format";
import { normalise, parse } from "@/lib/maths/expr";
import { MathHtml } from "./MathHtml";
import { KeypadToggle, MathKeypad, useKeypad } from "./MathKeypad";
import { Calculator, CalculatorToggle, useCalculatorOpen } from "./Calculator";
import { cn } from "@/lib/utils";

function placeholderFor(a: Answer): string {
  switch (a.kind) {
    case "num":
      return a.dp !== undefined
        ? `${a.dp} decimal place${a.dp === 1 ? "" : "s"}`
        : "Type your answer";
    case "frac":
      return a.mixed ? "e.g. 2 1/3" : "e.g. 3/4";
    case "nums":
      return "e.g. 5, −5";
    case "point":
      return "(x, y)";
    case "ratio":
      return "e.g. 2 : 3";
    case "sci":
      return "e.g. 3.2 × 10^5";
    case "primefactors":
      return "e.g. 2^3 × 5";
    case "expr":
      return "Type your answer";
    case "time":
      return a.ampm ? "e.g. 7:45 pm" : "e.g. 3:45";
    default:
      return "Type your answer";
  }
}

function helpFor(a: Answer): string | null {
  switch (a.kind) {
    case "frac":
      return a.mixed
        ? "Type a mixed number with a space, e.g. 2 1/3."
        : "Type fractions with a slash, e.g. 3/4.";
    case "nums":
      return "Type every answer, separated by commas.";
    case "sci":
      return "Type powers of ten with ^, e.g. 4.5 × 10^-3 (you can type x or * for ×).";
    case "primefactors":
      return "Use ^ for powers, e.g. 2^3 × 3^2.";
    case "expr":
      return "Use ^ for powers (x^2) and / for fractions. The keypad has these keys.";
    case "time":
      return a.ampm
        ? "Type the time with a colon, then am or pm, e.g. 7:45 pm."
        : "Type the time with a colon, e.g. 3:45.";
    default:
      return null;
  }
}

export type BoxState = "idle" | "right" | "wrong";

export function AnswerBox({
  q,
  value,
  onChange,
  onEnter,
  state = "idle",
  locked = false,
  wrongOptions = [],
  showCorrectOption = false,
  autoFocus = true,
  year = 7,
  enterLabel = "Check",
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  state?: BoxState;
  locked?: boolean;
  wrongOptions?: number[];
  showCorrectOption?: boolean;
  autoFocus?: boolean;
  /** Year level: Years 1–2 get bigger keys, and only secondary years get negative-number keys. */
  year?: number;
  enterLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursor = useRef<number | null>(null); // where to type when the box isn't focused
  const pad = useKeypad();
  const [calcOpen, setCalcOpen] = useCalculatorOpen();
  const a = q.answer;
  const calc = q.calc && !locked;

  useEffect(() => {
    if (autoFocus && !locked && inputRef.current && !pad.touch) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [q, autoFocus, locked, pad.touch]);

  if (a.kind === "mc") {
    const long = a.options.some((o) => o.replace(/<[^>]*>/g, "").length > 28);
    return (
      <div className="grid gap-3">
        {calc && (
          <div className="flex">
            <CalculatorToggle
              open={calcOpen}
              onToggle={() => setCalcOpen(!calcOpen)}
            />
          </div>
        )}
        {calc && calcOpen && (
          <Calculator year={year} onClose={() => setCalcOpen(false)} />
        )}
        <div
          className={cn("mc-options", !long && "cols-2")}
          role="radiogroup"
          aria-label="Choose an answer"
        >
          {a.options.map((opt, i) => {
            const selected = value === String(i);
            const isWrong = wrongOptions.includes(i);
            const isRight = showCorrectOption && i === a.correct;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={locked || isWrong}
                className={cn(
                  "mc-option",
                  selected && !isWrong && "selected",
                  isWrong && "wrong",
                  isRight && "right",
                  state === "right" && selected && "right",
                )}
                onClick={() => onChange(String(i))}
                onDoubleClick={() => {
                  onChange(String(i));
                  onEnter();
                }}
              >
                <span className="letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <MathHtml inline html={opt} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const layout = padLayout(a, year, q.prompt);
  const help = helpFor(a);
  const keypadOpen = pad.open && !locked;

  const caret = (): [number, number] => {
    const el = inputRef.current;
    if (el && document.activeElement === el)
      return [
        el.selectionStart ?? value.length,
        el.selectionEnd ?? value.length,
      ];
    const c = Math.min(cursor.current ?? value.length, value.length);
    return [c, c];
  };
  const place = (pos: number) => {
    cursor.current = pos;
    const el = inputRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(pos, pos);
    });
  };
  const remember = () => {
    const el = inputRef.current;
    if (el) cursor.current = el.selectionStart;
  };

  const actions = {
    insert: (text: string) => {
      if (locked) return;
      const [start, end] = caret();
      onChange(value.slice(0, start) + text + value.slice(end));
      place(start + text.length);
    },
    back: () => {
      if (locked) return;
      const [start, end] = caret();
      if (start !== end) {
        onChange(value.slice(0, start) + value.slice(end));
        place(start);
      } else if (start > 0) {
        // keys like " : " and " am" type several characters; delete them in one press
        const multi = [...layout.extras, ...layout.symbols]
          .map((k) => k.insert)
          .filter((t) => t.length > 1 && value.slice(0, start).endsWith(t));
        const n = multi.length ? Math.max(...multi.map((t) => t.length)) : 1;
        onChange(value.slice(0, start - n) + value.slice(start));
        place(start - n);
      }
    },
    move: (dir: -1 | 1) =>
      place(Math.max(0, Math.min(value.length, caret()[0] + dir))),
    enter: onEnter,
    close: () => {
      pad.setOpen(false);
      // on a touch screen, closing the keypad brings up the device keyboard instead
      if (pad.touch) requestAnimationFrame(() => inputRef.current?.focus());
    },
  };

  const preview = readsAs(a, value);

  return (
    <div className="grid gap-2">
      <div className="answer-row">
        {q.prefix && <MathHtml inline className="affix" html={q.prefix} />}
        <input
          ref={inputRef}
          className={cn(
            "field answer-input",
            state === "right" && "is-right",
            state === "wrong" && "is-wrong",
            year <= 2 && "answer-big",
          )}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            cursor.current = e.target.selectionStart;
          }}
          onSelect={remember}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          readOnly={locked}
          placeholder={placeholderFor(a)}
          aria-label="Your answer"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode={pad.touch && keypadOpen ? "none" : "text"}
          enterKeyHint="done"
        />
        {q.suffix && <MathHtml inline className="affix" html={q.suffix} />}
        {!locked && (
          <KeypadToggle
            open={keypadOpen}
            onToggle={() => (keypadOpen ? actions.close() : pad.setOpen(true))}
          />
        )}
        {calc && (
          <CalculatorToggle
            open={calcOpen}
            onToggle={() => setCalcOpen(!calcOpen)}
          />
        )}
      </div>
      {preview && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Reads as <MathHtml inline html={preview} />
        </p>
      )}
      {calc && calcOpen && (
        <Calculator
          year={year}
          onClose={() => setCalcOpen(false)}
          onUse={(text) => {
            onChange(text);
            place(text.length);
          }}
        />
      )}
      {keypadOpen && (
        <MathKeypad
          layout={layout}
          big={year <= 2}
          touch={pad.touch}
          canEnter={value.trim() !== ""}
          enterLabel={enterLabel}
          actions={actions}
        />
      )}
      {!locked && help && (
        <p className="text-sm text-muted-foreground">{help}</p>
      )}
    </div>
  );
}

/** A typeset preview of powers and fractions as the student types them, e.g. x^2 shows as x². */
function readsAs(a: Answer, value: string): string | null {
  if (!["expr", "primefactors", "sci"].includes(a.kind) || !/[\^]/.test(value))
    return null;
  const s = normalise(value);
  try {
    parse(s.replace(/^[a-zA-Z]\s*=\s*/, ""));
  } catch {
    return null;
  }
  return ex(s);
}
