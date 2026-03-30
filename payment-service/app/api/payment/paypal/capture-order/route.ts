import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import Payment from "@/models/Payment";
import { capturePayPalOrder } from "@/lib/paypal";

type CaptureBody = {
  paypalOrderId?: string;
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: CaptureBody = await req.json();

    if (!body.paypalOrderId) {
      return Response.json(
        { message: "paypalOrderId is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const result = await capturePayPalOrder(body.paypalOrderId);

    await Payment.findOneAndUpdate(
      { paypalOrderId: body.paypalOrderId },
      { $set: { status: "paid" } }
    );

    return Response.json(
      { message: "Payment captured successfully", paypal: result },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Capture PayPal order error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}