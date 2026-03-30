export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
export const PATIENT_URL = process.env.NEXT_PUBLIC_PATIENT_URL;
export const DOCTOR_URL = process.env.NEXT_PUBLIC_DOCTOR_URL;
export const APPOINTMENT_URL = process.env.NEXT_PUBLIC_APPOINTMENT_URL;
export const TELEMEDICINE_URL = process.env.NEXT_PUBLIC_TELEMEDICINE_URL;
export const PAYMENT_URL = process.env.NEXT_PUBLIC_PAYMENT_URL;
export const NOTIFICATION_URL = process.env.NEXT_PUBLIC_NOTIFICATION_URL;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}
export function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}