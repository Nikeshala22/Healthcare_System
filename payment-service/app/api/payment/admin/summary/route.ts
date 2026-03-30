import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Payment from "@/models/Payment";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: Request) {
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
    if (!decoded || decoded.role !== "admin") {
      return Response.json(
        { message: "Only admin can view payment summary" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const totalPayments = await Payment.countDocuments();
    const paidPayments = await Payment.countDocuments({ status: "paid" });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });
    const cancelledPayments = await Payment.countDocuments({ status: "cancelled" });

    const paidRecords = await Payment.find({ status: "paid" });
    const totalRevenueLkr = paidRecords.reduce(
      (sum, payment) => sum + (payment.amountLkr || 0),
      0
    );

    return Response.json(
      {
        message: "Payment summary fetched successfully",
        summary: {
          totalPayments,
          paidPayments,
          pendingPayments,
          failedPayments,
          cancelledPayments,
          totalRevenueLkr,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get payment summary error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}