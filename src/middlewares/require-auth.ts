import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth";
import { UnauthorizedError } from "../shared/errors/app-errors";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return next(new UnauthorizedError());
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
