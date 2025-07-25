"use client";

const Checkbox = ({
  checked,
  onCheckedChange,
  id,
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      {checked && (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      )}
    </button>
  );
};

export default Checkbox;
