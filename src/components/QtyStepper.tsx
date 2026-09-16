import { MAX_QTY } from "../catalog";

/** − 2 + control. Never goes below 1: removing an item is a separate action. */
export default function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (qty: number) => void;
  /** What is being counted, for screen readers, e.g. "Beri Honey, 1 kg". */
  label: string;
}) {
  return (
    <div className="qty" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer">
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="One more">
        +
      </button>
    </div>
  );
}
