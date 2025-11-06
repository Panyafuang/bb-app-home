import StatusCode from "../types/code-response";

export type ErrorDetail = { field?: string; message: string };

export class AppError extends Error {
    code: string;
    status: number;
    details?: ErrorDetail[];

    constructor(code: string, message: string, status = StatusCode.badRequest, details?: ErrorDetail[]) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }

    static notFound(msg = 'Resource not found') {
        return new AppError('NOT_FOUND', msg, StatusCode.notFound);
    }

    static invalidInput(details: ErrorDetail[], msg = 'Validation failed for one or more fields') {
        return new AppError('INVALID_INPUT', msg, StatusCode.unprocessableEntity, details);
    }

    static dbError(msg = 'Database error') {
        return new AppError('DB_ERROR', msg, StatusCode.internalServerError);
    }
}