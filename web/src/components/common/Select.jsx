import React, { useEffect, useId, useRef, useState } from "react";

/**
 * Accessible custom dropdown styled with Tailwind CSS.
 * Keyboard: Enter/Space/ArrowDown opens, ArrowUp/ArrowDown moves,
 * Enter selects, Escape/Tab closes, Home/End jump.
 */
export default function Select({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  ariaLabelledBy,
}) {
  const generatedId = useId();
  const baseId = id || `k-select-${generatedId}`;
  const listId = `${baseId}-list`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Close when clicking outside
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const commit = (index) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={baseId}
        ref={triggerRef}
        type="button"
        className={`w-full h-11 flex items-center justify-between gap-2 pl-3.5 pr-3 bg-white border rounded-lg text-[0.92rem] text-slate-900 text-left transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
          open
            ? "border-amber-500 shadow-amber-ring"
            : "border-slate-300 hover:border-slate-400 focus-visible:outline-none focus-visible:border-amber-500 focus-visible:shadow-amber-ring"
        }`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${baseId}` : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-amber-600" : "text-slate-500"
          }`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          className="absolute z-50 top-[calc(100%+4px)] inset-x-0 m-0 p-1 list-none bg-white border border-slate-300 rounded-xl shadow-pop max-h-60 overflow-y-auto"
          role="listbox"
          aria-labelledby={ariaLabelledBy}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                id={`${baseId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors duration-100 ${
                  isActive ? "bg-amber-50" : "bg-transparent"
                } ${isSelected ? "font-bold text-amber-700" : "text-slate-900"}`}
                onPointerEnter={() => setActiveIndex(index)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => commit(index)}
              >
                <span>
                  {option.label}
                  {option.description && (
                    <span className="block text-xs text-slate-500 font-normal">
                      {option.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <svg
                    className="text-amber-600 shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
