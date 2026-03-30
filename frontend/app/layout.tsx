"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PayPalScriptProvider
          options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
            currency: "USD",
            intent: "capture",
          }}
        >
          <Navbar />
          <main>{children}</main>
        </PayPalScriptProvider>
      </body>
    </html>
  );
}