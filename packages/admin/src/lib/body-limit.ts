/**
 * Request body size limit enforcement.
 * Provides a wrapper that checks Content-Length before parsing JSON bodies.
 */

const DEFAULT_MAX_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Checks the Content-Length header against the allowed maximum.
 * Returns a 413 Response if the body is too large, or null if OK.
 */
export function checkContentLength(
  request: Request,
  maxBytes = DEFAULT_MAX_BYTES,
): Response | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > maxBytes) {
      return Response.json(
        { error: `Request body too large. Maximum allowed: ${maxBytes / 1024 / 1024} MB.` },
        { status: 413 },
      );
    }
  }
  return null;
}
