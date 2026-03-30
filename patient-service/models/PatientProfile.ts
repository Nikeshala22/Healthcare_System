import mongoose, { Document, Model, Schema } from "mongoose";

interface MedicalReport {
  title: string;
  fileUrl: string;
  uploadedAt: Date;
}

interface MedicalHistoryItem {
  condition: string;
  notes: string;
  recordedAt: Date;
}

interface PrescriptionItem {
  doctorName: string;
  medication: string;
  dosage: string;
  instructions: string;
  issuedAt: Date;
}

export interface IPatientProfile extends Document {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalReports: MedicalReport[];
  medicalHistory: MedicalHistoryItem[];
  prescriptions: PrescriptionItem[];
  createdAt: Date;
  updatedAt: Date;
}

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    medicalReports: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        originalName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    medicalHistory: [
      {
        condition: { type: String, required: true },
        notes: { type: String, default: "" },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    prescriptions: [
      {
        doctorName: { type: String, required: true },
        medication: { type: String, required: true },
        dosage: { type: String, required: true },
        instructions: { type: String, default: "" },
        issuedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PatientProfile: Model<IPatientProfile> =
  (mongoose.models.PatientProfile as Model<IPatientProfile>) ||
  mongoose.model<IPatientProfile>("PatientProfile", patientProfileSchema);

export default PatientProfile;