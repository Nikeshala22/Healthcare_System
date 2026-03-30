export type NotificationEventType =
  | "appointment_booked"
  | "consultation_completed";

export interface PersonContact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface AppointmentInfo {
  date: string;
  time: string;
  specialty?: string;
  hospital?: string;
  meetingLink?: string;
  consultationSummary?: string;
}

export interface NotificationRequestBody {
  eventType: NotificationEventType;
  appointmentId: string;
  patient: PersonContact;
  doctor: PersonContact;
  appointment: AppointmentInfo;
}