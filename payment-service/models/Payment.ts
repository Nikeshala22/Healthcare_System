import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPayment extends Document {
  orderId: string;
  paypalOrderId?: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;

  amountLkr: number;
  currency: string;

  paypalAmount: number;
  paypalCurrency: string;

  status: "pending" | "paid" | "failed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true },
    paypalOrderId: { type: String },
    appointmentId: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },

    amountLkr: { type: Number, required: true },
    currency: { type: String, default: "LKR" },

    paypalAmount: { type: Number, required: true },
    paypalCurrency: { type: String, default: "USD" },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;