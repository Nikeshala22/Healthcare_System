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
    if (!decoded || decoded.role !== "patient") {
      return Response.json(
        { message: "Only patients can view patient prescriptions" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const prescriptions = await Prescription.find({
      patientId: decoded.userId,
    }).sort({ createdAt: -1 });

    return Response.json(
      { message: "Patient prescriptions fetched successfully", prescriptions },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Patient prescriptions error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}