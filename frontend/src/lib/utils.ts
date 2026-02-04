import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const capitalize = (value: string) =>
  value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";

export const formatDate = (date: Date | string) => {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
