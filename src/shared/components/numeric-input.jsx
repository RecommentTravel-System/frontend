export function NumericInput({
  value,
  onChange,
  placeholder = "Số lượng...",
  className = "",
  min = 1,
  max = 999,
  id,
  name,
  showSteppers = false,
  ...props
}) {
  const handleKeyDown = (e) => {
    // Allow navigation, backspace, delete, tab, enter
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x")) ||
      (e.metaKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
    ) {
      return;
    }

    // Block non-digit characters
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const rawVal = e.target.value;
    // Strip everything except digits
    const cleanVal = rawVal.replace(/\D/g, "");
    if (onChange) {
      onChange(cleanVal);
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const current = parseInt(value, 10) || 0;
    const next = Math.min(max, current + 1);
    if (onChange) onChange(String(next));
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const current = parseInt(value, 10) || 0;
    const next = Math.max(min, current - 1);
    if (onChange) onChange(String(next));
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        id={id}
        name={name}
        value={value ?? ""}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className={className}
        {...props}
      />
      {showSteppers && (
        <div className="absolute right-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            title="Giảm"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleIncrement}
            className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            title="Tăng"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
