import mongoose, { Document, Model, Schema } from "mongoose";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IDoctorProfile extends Document {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  qualification: string;
  hospital: string;
  experience: number;
  bio: string;
  consultationFee: number;
  availability: AvailabilitySlot[];
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<AvailabilitySlot>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const doctorProfileSchema = new Schema<IDoctorProfile>(
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
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      default: "",
    },
    hospital: {
      type: String,
      default: "",
    },
    experience: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: "",
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const DoctorProfile: Model<IDoctorProfile> =
  (mongoose.models.DoctorProfile as Model<IDoctorProfile>) ||
  mongoose.model<IDoctorProfile>("DoctorProfile", doctorProfileSchema);

export default DoctorProfile;