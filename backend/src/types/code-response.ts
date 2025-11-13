// src/types/code-response.ts
enum StatusCode {
  // ✅ กลุ่ม Success (2xx)
  ok = 200,
  created = 201,
  noContent = 204,

  // ⚠️ กลุ่ม Client Error (4xx)
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  conflict = 409,
  unprocessableEntity = 422, // ใช้กับ validation error
  tooManyRequests = 429,

  // 💥 กลุ่ม Server Error (5xx)
  internalServerError = 500,
  notImplemented = 501,
  badGateway = 502,
  serviceUnavailable = 503,
  gatewayTimeout = 504,
}

export default StatusCode;
