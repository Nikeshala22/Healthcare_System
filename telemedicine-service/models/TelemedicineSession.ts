import mongoose, { Document, Model, Schema } from "mongoose";

export type SessionStatus = "scheduled" | "active" | "ended";

export interface ITelemedicineSession extends Document {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  sessionLink: string;
  scheduledDate: string;
  scheduledTime: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const telemedicineSessionSchema = new Schema<ITelemedicineSession>(
  {
    appointmentId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    sessionLink: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const TelemedicineSession: Model<ITelemedicineSession> =
  (mongoose.models.TelemedicineSession as Model<ITelemedicineSession>) ||
  mongoose.model<ITelemedicineSession>(
    "TelemedicineSession",
    telemedicineSessionSchema
  );

export default TelemedicineSession;