import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Prescription from "@/models/Prescription";

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
    if (!decoded || decoded.role !== "doctor") {
      return Response.json(
        { message: "Only doctors can view doctor prescriptions" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const prescriptions = await Prescription.find({
      doctorId: decoded.userId,
    }).sort({ createdAt: -1 });

    return Response.json(
      { message: "Doctor prescriptions fetched successfully", prescriptions },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Doctor prescriptions error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}