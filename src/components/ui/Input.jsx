"use client";

const Input = ({
  type = "text",
  className = "",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  required = false,
  maxLength,
  min,
  max,
  id,
  ...props
}) => {
  const baseClasses =
    "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:border-[#ef3131] focus-visible:ring-2 focus-visible:ring-[#ef3131] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <input
      type={type}
      id={id}
      className={`${baseClasses} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      min={min}
      max={max}
      {...props}
    />
  );
};

export default Input;
