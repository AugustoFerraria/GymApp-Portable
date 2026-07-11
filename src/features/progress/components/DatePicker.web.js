import React from "react";

function toInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePicker({
  value,
  onChange,
  label,
  isDark,
  borderColor,
  textColor,
}) {
  const handleChange = event => {
    const parts = event.currentTarget.value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return;

    const [year, month, day] = parts;
    onChange({ type: "set" }, new Date(year, month - 1, day));
  };

  return (
    <input
      aria-label={label}
      type="date"
      value={toInputValue(value)}
      onChange={handleChange}
      style={{
        width: "100%",
        boxSizing: "border-box",
        marginTop: 8,
        padding: 10,
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        backgroundColor: isDark ? "#1A1F29" : "#FFFFFF",
        color: textColor,
        colorScheme: isDark ? "dark" : "light",
        fontSize: 16,
      }}
    />
  );
}