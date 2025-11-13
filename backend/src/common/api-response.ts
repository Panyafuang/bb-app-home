/** API Response Format */

import StatusCode from "../types/code-response";

export type Success<T> = { status: "success"; data: T };
export type ListSuccess<T> = Success<{
  items: T[];
  meta: {
    page: number;
    limit: number;
    total?: number;
  }
}>;

export function ok<T>(res: any, data: T, status = StatusCode.ok) {
  res.status(status).json({
    status: "success",
    data,
  } as Success<T>);
}

export function listOk<T>(res: any, items: T[], page?: number, limit?: number, total?: number) {
  const payload = {
    items,
    meta: {
      page,
      limit,
      ...(total != null ? { total } : {})
    }
  };
  return ok(res, payload);
}

export function created<T>(res: any, data: T) {
  return ok(res, data, StatusCode.created);
}

export function deleted(res: any) {
  return ok(res, { deleted: true });
}
