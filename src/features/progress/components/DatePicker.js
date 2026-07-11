import React from "react";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DatePicker({ value, onChange, label }) {
  return (
    <DateTimePicker
      value={value ?? new Date()}
      mode="date"
      display={Platform.OS === "ios" ? "inline" : "default"}
      onChange={onChange}
      accessibilityLabel={label}
    />
  );
}
