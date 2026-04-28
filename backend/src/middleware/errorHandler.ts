import { Request, Response, NextFunction } from 'express';

export interface ApiError {
  statusCode: number;
  message: string;
  details?: unknown;
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  if ('statusCode' in err && 'message' in err) {
    const apiError = err as ApiError;
    res.status(apiError.statusCode).json({
      error: apiError.message,
      details: apiError.details,
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

/**
 * Not found middleware
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Route not found',
  });
}

/**
 * Logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}
