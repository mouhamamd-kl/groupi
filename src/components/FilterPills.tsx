"use client";

interface FilterItem {
  value: string | number;
  label: string;
}

interface FilterPillsProps {
  items: FilterItem[];
  selected: Array<string | number>;
  onToggle: (value: string | number) => void;
  onClear: () => void;
  label: string;
}

export default function FilterPills({
  items,
  selected,
  onToggle,
  onClear,
  label,
}: FilterPillsProps) {
  const isEmpty = selected.length === 0;

  return (
    <div className="filter-row" role="group" aria-label={label}>
      <button
        type="button"
        className={`filter-pill filter-pill-all ${isEmpty ? "active" : ""}`}
        aria-pressed={isEmpty}
        onClick={onClear}
      >
        الكل
      </button>

      {items.map((item) => {
        const isActive = selected.includes(item.value);

        return (
          <button
            key={String(item.value)}
            type="button"
            className={`filter-pill ${isActive ? "active" : ""}`}
            aria-pressed={isActive}
            onClick={() => onToggle(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}