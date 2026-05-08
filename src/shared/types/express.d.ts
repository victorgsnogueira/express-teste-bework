import { Session } from "../../auth/auth";

declare global {
  namespace Express {
    interface Request {
      user: Session["user"];
      session: Session["session"];
    }
  }
}
