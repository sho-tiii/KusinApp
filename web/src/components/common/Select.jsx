import React, { useEffect, useId, useRef, useState } from "react";

/**
 * Accessible custom dropdown that matches the KusinApp design system.
 * Replaces the native <select>, whose option list is rendered by the OS/browser
 * and cannot be reliably styled (it turned dark/unreadable in dark mode).
 *
 * Keyboard: Enter/Space/ArrowDown opens, ArrowUp/ArrowDown moves,
 * Enter selects, Escape/Tab closes, Home/End jump.
 *
 * @param {{
 *   id?: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   options: { value: string, label: string, description?: string }[],
 *   placeholder?: string,
 *   disabled?: boolean,
 *   ariaLabelledBy?: string,
 * }} props
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
    <div className="k-select" ref={rootRef}>
      <button
        id={baseId}
        ref={triggerRef}
        type="button"
        className="k-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${baseId}` : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? undefined : "k-select-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="k-select-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul id={listId} className="k-select-menu" role="listbox" aria-labelledby={ariaLabelledBy}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${baseId}-opt-${index}`}
              role="option"
              className="k-select-option"
              aria-selected={option.value === value}
              data-active={index === activeIndex}
              onPointerEnter={() => setActiveIndex(index)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => commit(index)}
            >
              <span>
                {option.label}
                {option.description && <span className="k-select-option-desc">{option.description}</span>}
              </span>
              {option.value === value && (
                <svg className="k-select-check" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
