import { Hono } from "hono";
import { promises as fs } from "fs";
import sharp from "sharp";

import { readImageBuffer } from "./helpers/file";
import {
  buildPathsFromBase,
  buildPathsFromSrc,
  splitFilename,
} from "./helpers/path";
import { createImageResponse, createJsonResponse } from "./helpers/response";
import { parseQuality, parseWidth } from "./helpers/validation";

const app = new Hono();

app.get("/:src", async (c) => {
  const { src } = c.req.param();
  const thumbnail = c.req.query("thumbnail");
  const { originalPath, thumbnailPath } = buildPathsFromSrc(src);
  const isThumbnailRequested = typeof thumbnail === "string";

  if (isThumbnailRequested) {
    const thumbnailResult = await readImageBuffer(thumbnailPath);
    if (!thumbnailResult.ok) {
      return createJsonResponse(404, { message: "Thumbnail not found" });
    }

    return createImageResponse(thumbnailResult.value, "image/png");
  }

  const widthResult = parseWidth(c.req.query("w"));
  if (!widthResult.ok) {
    return createJsonResponse(400, { message: widthResult.error.message });
  }

  const quality = parseQuality(c.req.query("q"));
  const imageResult = await readImageBuffer(originalPath);
  if (!imageResult.ok) {
    return createJsonResponse(404, { message: "Image not found" });
  }

  const resizedImageBuffer = await sharp(imageResult.value)
    .png({ quality })
    .resize(widthResult.value)
    .toBuffer();

  return createImageResponse(resizedImageBuffer, "image/png");
});

app.post("/", async (c) => {
  const formData = await c.req.formData();
  const image = formData.get("image");

  if (!image || !(image instanceof Blob)) {
    return createJsonResponse(400, { error: "Invalid image" });
  }

  const arrayBuffer = await image.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const filename = image.name || "image";
  const { baseName: baseFilename, extension: fileExtension } =
    splitFilename(filename);

  const { originalPath, thumbnailPath } = buildPathsFromBase(
    baseFilename,
    fileExtension,
  );
  await fs.writeFile(originalPath, fileBuffer);

  const thumbnailBuffer = await sharp(fileBuffer).blur(1).resize(10).toBuffer();
  await fs.writeFile(thumbnailPath, thumbnailBuffer);

  return createJsonResponse(201, { message: "Image uploaded successfully" });
});

export default {
  port: 3001,
  fetch: app.fetch,
};
