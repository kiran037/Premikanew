import { AdminSessionPayload } from "@/services/admin-auth.service";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSessionPayload;
    }
  }
}
