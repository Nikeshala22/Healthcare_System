export const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
export const PATIENT_URL = process.env.NEXT_PUBLIC_PATIENT_URL;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}