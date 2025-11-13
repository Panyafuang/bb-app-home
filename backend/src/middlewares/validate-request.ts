import { validationResult } from "express-validator";
import StatusCode from "../types/code-response";


export function validateRequest(req: any, res: any, next: any) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result
        .formatWith((e: any) => ({
            field: e.path ?? e.param,
            message: e.msg
        }))
        .array();
    return res.status(StatusCode.unprocessableEntity).json({
        status: "error",
        code: "INVALID_INPUT",
        message: "Validation failed for one or more fields.",
        details,
    });
}