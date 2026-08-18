import { Request, Response, NextFunction } from "express";
import { sendTestEmail } from "@/utils/emailService";
import { sendSuccess, sendError } from "@/utils/api-response";

export class EmailController {
  static async handleTestEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req.body?.email || req.query?.email || "kiranrawal037@gmail.com") as string;
      const result = await sendTestEmail(email);

      if (!result.success) {
        return sendError(res, result.error || "Failed to send test email", undefined, 500);
      }

      return sendSuccess(res, result, "Test email sent successfully");
    } catch (err) {
      return next(err);
    }
  }
}
