import { AdminSessionPayload } from "@/services/admin-auth.service";

export interface CustomerPayload {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName?: string | null;
  avatar?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSessionPayload;
      customer?: CustomerPayload;
    }
  }
}
