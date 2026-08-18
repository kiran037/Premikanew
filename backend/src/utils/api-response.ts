import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  paginationOrMessage?: PaginationMeta | string,
  status = 200
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (paginationOrMessage && typeof paginationOrMessage === "object") {
    body.pagination = paginationOrMessage;
  }

  return res.status(status).json(body);
}

export function sendError(
  res: Response,
  message: string,
  errors?: any,
  status = 400
) {
  const body: ApiErrorResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(status).json(body);
}
