import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../shared/errors/app-errors";

function formatIssues(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

export function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(new ValidationError(formatIssues(result.error)));
    }

    req.body = result.data;
    return next();
  };
}

export function validateParams(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(new ValidationError(formatIssues(result.error)));
    }

    return next();
  };
}
