"use client";

import React from "react";

export const RadioGroup = ({
  children,
  value,
  onValueChange,
  className = "",
  ...props
}) => {
  return (
    <div className={`grid gap-2 ${className}`} {...props}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          groupValue: value,
          onGroupValueChange: onValueChange,
        })
      )}
    </div>
  );
};

export const RadioGroupItem = ({
  value,
  id,
  groupValue,
  onGroupValueChange,
  className = "",
  ...props
}) => {
  const isChecked = groupValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      className={`aspect-square h-4 w-4 rounded-full border border-gray-200 text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => onGroupValueChange(value)}
      {...props}
    >
      {isChecked && (
        <div className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      )}
    </button>
  );
};
