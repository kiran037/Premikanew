import { Request, Response, NextFunction } from "express";
import { DELHIVERY_CONFIG, mapDelhiveryStatusToShipmentStatus } from "@/utils/delhivery";
import { ShipmentRepository } from "@/repositories/shipment.repository";
import { OrderRepository } from "@/repositories/order.repository";

export class WebhookController {
  static async handleDelhiveryWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const expectedSecret = DELHIVERY_CONFIG.webhookSecret;
      if (expectedSecret) {
        const headerSecret = (req.headers["x-delhivery-secret"] as string) || (req.headers["authorization"] as string);
        const urlSecret = req.query.secret as string | undefined;

        if (headerSecret !== expectedSecret && urlSecret !== expectedSecret) {
          return res.status(401).json({ success: false, message: "Unauthorized webhook request" });
        }
      }

      const payload = req.body || {};
      const waybill = payload.waybill || payload.AWB || payload.wbn;
      const rawStatus = payload.status || payload.Status || payload.scans?.[0]?.scanType;

      if (!waybill || !rawStatus) {
        return res.status(200).json({ success: true, message: "Webhook event ignored: Missing waybill or status payload" });
      }

      const shipment = await ShipmentRepository.getShipmentByTrackingNumber(waybill);
      if (!shipment) {
        return res.status(200).json({ success: true, message: `No matching internal shipment found for AWB ${waybill}` });
      }

      const newShipmentStatus = mapDelhiveryStatusToShipmentStatus(rawStatus);

      const updatedShipment = await ShipmentRepository.updateShipmentStatus(shipment.id, {
        status: newShipmentStatus,
        deliveredAt: newShipmentStatus === "delivered" ? new Date() : shipment.deliveredAt || undefined,
      });

      await ShipmentRepository.addTrackingHistory({
        shipmentId: shipment.id,
        status: newShipmentStatus,
        location: payload.location || payload.scans?.[0]?.location || "Delhivery Network",
        description: payload.instructions || payload.scans?.[0]?.instructions || rawStatus,
      });

      let orderStatus = "shipped";
      if (newShipmentStatus === "delivered") orderStatus = "delivered";
      else if (newShipmentStatus === "failed" || newShipmentStatus === "returned") orderStatus = "cancelled";

      await OrderRepository.updateOrderStatusAndFulfillment(shipment.orderId, {
        status: orderStatus as any,
      });

      return res.status(200).json({
        success: true,
        message: `Delhivery webhook processed successfully for AWB ${waybill}`,
        data: { shipmentId: shipment.id, newStatus: newShipmentStatus },
      });
    } catch (err: any) {
      console.error("Error processing Delhivery webhook:", err);
      return res.status(500).json({ success: false, message: err.message || "Error processing webhook payload" });
    }
  }
}
