import { ZodError } from "zod";
import { AppError } from "../../../../shared/errors/app.error";
import { ErrorCode } from "../../../../shared/errors/error-codes";
import { InternalError } from "../../../../shared/errors/internal.error";
import type { Logger } from "../../../../shared/logging/logger";
import type { HttpErrorHandler } from "../../http-request";

export function createErrorHandler(logger: Logger): HttpErrorHandler {
  return (err, req, res) => {
    const requestMeta = { method: req.method, path: req.path };

    if (err instanceof AppError) {
      logger.warn("Application error", {
        ...requestMeta,
        code: err.code,
        status: err.statusCode,
        message: err.message,
      });
      res.status(err.statusCode).json(err.toJSON());
      return;
    }

    if (err instanceof ZodError) {
      logger.warn("Validation error", {
        ...requestMeta,
        issues: err.issues,
      });
      res.status(400).json({
        error: err.issues[0]?.message ?? "Validation failed",
        code: ErrorCode.VALIDATION_ERROR,
      });
      return;
    }

    logger.error("Unhandled error", { ...requestMeta, err });
    res.status(500).json(new InternalError().toJSON());
  };
}
