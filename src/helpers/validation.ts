import type { Result } from "./result";

export function parseWidth(
  widthParam: string | undefined,
): Result<number, Error> {
  if (!widthParam) {
    return {
      ok: false,
      error: new Error("Width query parameter (w) is required"),
    };
  }

  const parsedWidth = Number(widthParam);
  const isPositiveInteger = Number.isInteger(parsedWidth) && parsedWidth > 0;
  if (!isPositiveInteger) {
    return { ok: false, error: new Error("Width must be a positive integer") };
  }

  return { ok: true, value: parsedWidth };
}

export function parseQuality(qualityParam: string | undefined): number {
  if (!qualityParam) {
    return 75;
  }

  const parsedQuality = Number(qualityParam);
  return Number.isNaN(parsedQuality) ? 75 : parsedQuality;
}
