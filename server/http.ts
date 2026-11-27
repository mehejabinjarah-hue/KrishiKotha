import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../shared/types.js';

const MAX_BODY_BYTES = 100 * 1024; // 100 KB limit

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown[];

  constructor(status: number, code: string, message: string, details?: unknown[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAllowedOrigin(req: IncomingMessage): string | null {
  const origin = req.headers.origin;
  if (!origin) return null;

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (typeof host === 'string') {
    try {
      const parsed = new URL(origin);
      if (parsed.host === host) return origin;
      if (
        process.env.NODE_ENV !== 'production' &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
      ) {
        return origin;
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function applySecurityHeaders(req: IncomingMessage, res: ServerResponse): void {
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
}

export function sendOk<T>(res: ServerResponse, data: T, status = 200): void {
  const payload: ApiSuccessEnvelope<T> = { ok: true, data };
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function sendError(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  details?: unknown[]
): void {
  const payload: ApiErrorEnvelope = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  // Vercel's Node runtime may pre-parse req.body
  const maybePreparsed = (req as IncomingMessage & { body?: unknown }).body;
  if (maybePreparsed !== undefined) {
    return maybePreparsed;
  }

  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body exceeds 100 KB limit'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch {
        reject(new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON'));
      }
    });

    req.on('error', () => {
      reject(new ApiError(400, 'READ_ERROR', 'Failed to read request body'));
    });
  });
}

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}
