import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { hashRequest } from '../utils/validation';

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
  cachedResponse?: unknown;
}

/**
 * Idempotency middleware - handles duplicate request detection
 * Stores request hash and caches responses for retries
 */
export async function idempotencyMiddleware(
  req: IdempotentRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Only apply to POST requests
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  // If no idempotency key, proceed normally
  if (!idempotencyKey) {
    return next();
  }

  try {
    // Check if we've already processed this idempotency key
    const existingRequest = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingRequest) {
      // Return cached response
      const cachedResponse = JSON.parse(existingRequest.response);
      res.status(200).json(cachedResponse);
      return;
    }

    // Store the idempotency key and request hash
    const requestHash = hashRequest(req.body);
    req.idempotencyKey = idempotencyKey;

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = function (data: unknown) {
      // Cache the response for future identical requests
      cacheResponse(idempotencyKey, requestHash, data).catch((err) => {
        console.error('Failed to cache response:', err);
      });
      return originalJson(data);
    };

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    next();
  }
}

async function cacheResponse(key: string, hash: string, response: unknown): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    await prisma.idempotencyKey.create({
      data: {
        key,
        requestHash: hash,
        response: JSON.stringify(response),
        expiresAt,
      },
    });
  } catch (error) {
    // If key already exists (race condition), that's fine
    console.debug('Idempotency key already exists:', error);
  }
}
