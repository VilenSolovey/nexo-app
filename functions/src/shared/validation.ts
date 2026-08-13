import {HttpsError} from "firebase-functions/v2/https";

export function asString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }

  return value.trim();
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ?
    value.filter(
      (item): item is string => typeof item === "string" && Boolean(item.trim())
    ) :
    [];
}
