import { Session, SessionUser } from "../../auth/auth";

declare global {
  namespace Express {
    interface Request {
      user: SessionUser;
      session: Session["session"];
    }
  }
}
