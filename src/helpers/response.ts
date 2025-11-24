export function createJsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return Response.json(body, { status });
}

export function createImageResponse(
  buffer: Buffer,
  contentType: string,
): Response {
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": contentType },
  });
}
