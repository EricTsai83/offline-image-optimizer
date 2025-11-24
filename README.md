# Offline Image Optimizer

Offline-first image pipeline built with Bun + Hono + Sharp. It uploads, resizes, compresses, and generates blurred thumbnails entirely on your local machine—no S3 bucket or CDN required.

## Requirements
- Bun 1.1+ (`bun --version` to confirm)
- Sharp native toolchain (macOS users can rely on Xcode Command Line Tools)

## Installation & Run
```bash
git clone https://github.com/EricTsai83/offline-image-optimizer.git
cd offline-image-optimizer
bun install
bun run dev
```

The server always listens on `http://localhost:3001`.

## Workflow Summary
1. **Upload the source file** via `POST /` (field name `image`). The server saves the original file and creates a `-thumbnail` companion.
2. **Request on-the-fly PNG resizing** with `GET /:src?w=&q=`. Width is required; quality is optional (0–100).
3. **Grab the blurred thumbnail** using `GET /:src?thumbnail=1`, perfect for Low-Quality Image Placeholders (LQIP).

Follow these steps in order so that the assets exist before you call any GET routes.

### 1. Upload an image (thumbnail auto-generated)
```bash
curl -X POST http://localhost:3001 \
  -F "image=@/absolute/path/to/photo.jpg"
```

Successful response:
```json
{ "message": "Image uploaded successfully" }
```

This single call produces two files inside `src/`:
- `photo.jpg`
- `photo-thumbnail.jpg`

If the `image` field is missing or invalid, the server returns `400 { "error": "Invalid image" }`.

### 2. Resize an existing image
```bash
curl "http://localhost:3001/photo.jpg?w=640&q=80" --output resized.png
```

| Query | Required | Description |
| --- | --- | --- |
| `w` | ✅ | Positive integer, final width in pixels |
| `q` | ❌ | PNG quality (0–100). Defaults to 75 when omitted or invalid |

The response is `image/png`. If the original asset is missing you’ll get `404 { "message": "Image not found" }`. Invalid `w` values return `400`.

### 3. Fetch the saved blurred thumbnail
```bash
curl "http://localhost:3001/photo.jpg?thumbnail=1" --output blur.png
```

Any `thumbnail` query value works. The server streams the cached blurred PNG. If it has never been generated, you’ll see `404 { "message": "Thumbnail not found" }`.

## API Quick Reference

### `POST /`
- Content-Type: `multipart/form-data`
- Field: `image` (single file, required)
- Success: `201 { message }`
- Failure: `400` (invalid payload)

### `GET /:src`
- Query: `w` (required), `q` (optional)
- Response: Resized PNG

### `GET /:src?thumbnail=...`
- Query: any value, as long as `thumbnail` exists
- Response: Stored blurred PNG

## File Naming Rules
- Original asset: `<baseName><extension>`
- Thumbnail: `<baseName>-thumbnail<extension>`
- Example: `demo-image.jpg` → `demo-image-thumbnail.jpg`

## Project Layout
- `src/index.ts` – Hono server wiring POST uploads and GET transforms
- `src/helpers/file.ts` – Result-wrapped file reader
- `src/helpers/path.ts` – Filename splitting and path building
- `src/helpers/validation.ts` – Query parsing and validation
- `src/helpers/response.ts` – JSON / image response helpers
- `src/helpers/result.ts` – Shared Result type
- `src/demo-image*.jpg` – Example assets for quick tests

## Reference
Inspired by the offline workflow from this tutorial: <https://www.youtube.com/watch?v=7hS9b6n7HrM>
