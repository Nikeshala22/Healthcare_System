import mongoose, { Document, Model, Schema } from "mongoose";

export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface IAppointment extends Document {
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  specialty: string;
  consultationFee: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, default: "" },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorEmail: { type: String, required: true },
    doctorPhone: { type: String, default: "" },
    specialty: { type: String, required: true },
    consultationFee: { type: Number, required: true, default: 0 },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Appointment: Model<IAppointment> =
  (mongoose.models.Appointment as Model<IAppointment>) ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;