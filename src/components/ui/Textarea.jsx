"use client";

const Textarea = ({
  className = "",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  required = false,
  rows = 3,
  id,
  ...props
}) => {
  const baseClasses =
    "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-[#ef3131] focus-visible:ring-2 focus-visible:ring-[#ef3131] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <textarea
      id={id}
      className={`${baseClasses} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      rows={rows}
      {...props}
    />
  );
};

export default Textarea;
