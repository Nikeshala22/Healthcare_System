import { normalizePhoneNumber } from "@/utils/phone";

type SendSmsInput = {
  phone: string;
  message: string;
};

export async function sendSms({ phone, message }: SendSmsInput) {
  const key = process.env.TEXTBELT_KEY || "textbelt";
  const normalizedPhone = normalizePhoneNumber(phone);

  const response = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: normalizedPhone,
      message,
      key,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Textbelt SMS failed");
  }

  return {
    provider: "textbelt",
    providerMessageId: data.textId || "",
    raw: data,
  };
}