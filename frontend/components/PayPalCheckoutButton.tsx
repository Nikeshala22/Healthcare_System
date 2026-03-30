"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { PAYMENT_URL, getAuthHeaders } from "@/lib/api";

type Props = {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  amount: number;
  onSuccess?: () => void;
};

export default function PayPalCheckoutButton({
  appointmentId,
  doctorId,
  doctorName,
  amount,
  onSuccess,
}: Props) {
  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      createOrder={async () => {
        console.log("PayPal button payload:", {
          appointmentId,
          doctorId,
          doctorName,
          amount,
        });

        const res = await fetch(`${PAYMENT_URL}/api/payment/paypal/create-order`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            appointmentId,
            doctorId,
            doctorName,
            amount,
          }),
        });

        const data = await res.json();

        console.log("PayPal create-order response:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to create PayPal order");
        }

        return data.paypalOrderId;
      }}
      onApprove={async (data) => {
        const res = await fetch(`${PAYMENT_URL}/api/payment/paypal/capture-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paypalOrderId: data.orderID,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to capture PayPal payment");
        }

        alert("Payment successful");
        onSuccess?.();
      }}
      onError={(err) => {
        console.error("PayPal payment error:", err);
        alert("PayPal payment error");
      }}
    />
  );
}