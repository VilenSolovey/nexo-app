import {Timestamp} from "firebase-admin/firestore";
import type {ChronicleDiscoveryPayload} from "../types.js";

const CHRONICLE_TIME_ZONE = "Europe/Kyiv";
const CHRONICLE_DISCOVERY_HOUR = 8;

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function toMillis(value: unknown): number | null {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as {toMillis?: unknown}).toMillis === "function"
  ) {
    return (value as {toMillis: () => number}).toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as {toDate?: unknown}).toDate === "function"
  ) {
    return (value as {toDate: () => Date}).toDate().getTime();
  }

  if (typeof value === "number") {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getZonedDateParts(
  timestampMs: number,
  timeZone: string
): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestampMs));
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateTimeToUtcMs(
  parts: Omit<ZonedDateParts, "minute" | "second"> & {
    minute?: number;
    second?: number;
  },
  timeZone: string
): number {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute ?? 0,
    parts.second ?? 0
  );
  const getOffset = (instant: number) => {
    const zoned = getZonedDateParts(instant, timeZone);
    const representedAsUtc = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second
    );
    return representedAsUtc - instant;
  };
  const firstPass = utcGuess - getOffset(utcGuess);

  return utcGuess - getOffset(firstPass);
}

/** Nearest upcoming 08:00 in Kyiv: today before 08:00, otherwise tomorrow. */
export function getNextChronicleDiscoveryAt(nowMs = Date.now()): Timestamp {
  const kyivNow = getZonedDateParts(nowMs, CHRONICLE_TIME_ZONE);
  const localDateMs = Date.UTC(kyivNow.year, kyivNow.month - 1, kyivNow.day);
  const targetLocalDate = new Date(
    localDateMs + (kyivNow.hour >= CHRONICLE_DISCOVERY_HOUR ? 86_400_000 : 0)
  );
  const readyAtMs = zonedDateTimeToUtcMs({
    year: targetLocalDate.getUTCFullYear(),
    month: targetLocalDate.getUTCMonth() + 1,
    day: targetLocalDate.getUTCDate(),
    hour: CHRONICLE_DISCOVERY_HOUR,
  }, CHRONICLE_TIME_ZONE);

  return Timestamp.fromMillis(readyAtMs);
}

export function discoveryPayloadFromData(
  value: unknown
): ChronicleDiscoveryPayload | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const data = value as Record<string, unknown>;
  if (typeof data.fragmentId !== "string") return null;
  const readyAt = data.readyAt;
  const readyAtDate = readyAt instanceof Timestamp ?
    readyAt.toDate() :
    typeof readyAt === "string" || typeof readyAt === "number" ?
      new Date(readyAt) :
      null;
  if (!readyAtDate || Number.isNaN(readyAtDate.getTime())) return null;

  return {
    fragmentId: data.fragmentId,
    readyAt: readyAtDate.toISOString(),
  };
}
