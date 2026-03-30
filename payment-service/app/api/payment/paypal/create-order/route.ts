import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Payment from "@/models/Payment";
import { createPayPalOrder } from "@/lib/paypal";

type CreateBody = {
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  amount?: number; // amount in LKR from frontend
};

function convertLkrToUsd(lkr: number) {
  const exchangeRate = 300; // Example rate: 1 USD = 300 LKR
  return Number((lkr / exchangeRate).toFixed(2));
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeader(req);
    if (!token) {
      return Response.json(
        { message: "Token missing" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "patient") {
      return Response.json(
        { message: "Only patients can create payments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: CreateBody = await req.json();

    if (!body.appointmentId || !body.doctorId || !body.doctorName || !body.amount) {
      return Response.json(
        { message: "appointmentId, doctorId, doctorName, amount are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const orderId = `ORDER-${Date.now()}`;

    const amountLkr = Number(body.amount);
    const paypalAmount = convertLkrToUsd(amountLkr);

    const paypalOrder = await createPayPalOrder({
      amount: paypalAmount.toFixed(2),
      currency: "USD",
      description: `Consultation Fee - ${body.doctorName}`,
      referenceId: orderId,
    });

    await Payment.create({
      orderId,
      paypalOrderId: paypalOrder.id,
      appointmentId: body.appointmentId,
      patientId: decoded.userId,
      patientName: decoded.name,
      patientEmail: decoded.email,
      doctorId: body.doctorId,
      doctorName: body.doctorName,

      amountLkr,
      currency: "LKR",

      paypalAmount,
      paypalCurrency: "USD",

      status: "pending",
    });

    return Response.json(
      {
        message: "PayPal order created",
        paypalOrderId: paypalOrder.id,
        internalOrderId: orderId,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Create PayPal order error FULL:", error);
    return Response.json(
      {
        message: "Internal server error",
        error: error?.message || String(error),
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}