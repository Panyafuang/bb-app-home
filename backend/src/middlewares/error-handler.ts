import { NextFunction, Request, Response } from "express";
import debugFactory from 'debug';
import { AppError } from "../common/app-error";
import StatusCode from "../types/code-response";

const log = debugFactory('app:error');

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const isApp = err instanceof AppError;
  
  const status = isApp ? err.status : StatusCode.internalServerError;
  const code = isApp ? err.code : 'INTERNAL_ERROR';
  const message = isApp ? err.message: 'Internal Server Error';
  const details = isApp ? err.details : undefined;

  log('%O', err);

  res.status(status).json({
    status: 'error',
    code,
    message,
    ...(details ? { details } : {}),
  });
}