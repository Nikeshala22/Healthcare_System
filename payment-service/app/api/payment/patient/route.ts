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
    if (!decoded || decoded.role !== "patient") {
      return Response.json(
        { message: "Only patients can view payments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const payments = await Payment.find({
      patientId: decoded.userId,
    }).sort({ createdAt: -1 });

    return Response.json(
      { message: "Payments fetched successfully", payments },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get patient payments error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}