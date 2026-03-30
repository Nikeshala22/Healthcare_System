import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPrescription extends Document {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  medicines: string;
  instructions: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    appointmentId: { type: String, required: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    medicines: { type: String, required: true },
    instructions: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Prescription: Model<IPrescription> =
  (mongoose.models.Prescription as Model<IPrescription>) ||
  mongoose.model<IPrescription>("Prescription", prescriptionSchema);

export default Prescription;