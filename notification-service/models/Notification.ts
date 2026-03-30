import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string;
  recipientName: string;
  recipientEmail: string;
  type: string;
  subject: string;
  message: string;
  emailStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    emailStatus: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;