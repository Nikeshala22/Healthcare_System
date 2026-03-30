import emailjs from "@emailjs/nodejs";

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID!;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY!;

if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  throw new Error("Missing EmailJS environment variables");
}

export async function sendEmail(
  toName: string,
  toEmail: string,
  subject: string,
  message: string
) {
  return await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: toName,
      to_email: toEmail,
      subject,
      message,
    },
    {
      publicKey: PUBLIC_KEY,
    }
  );
}