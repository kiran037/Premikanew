import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "@/utils/api-response";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation error";
    return sendError(res, message, err.flatten(), 400);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  return sendError(res, message, undefined, statusCode);
}
