import { promises as fs } from "fs";

import type { Result } from "./result";

export async function readImageBuffer(
  absolutePath: string,
): Promise<Result<Buffer, Error>> {
  try {
    const buffer = await fs.readFile(absolutePath);
    return { ok: true, value: buffer };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error };
    }
    return { ok: false, error: new Error("Unknown file read error") };
  }
}
