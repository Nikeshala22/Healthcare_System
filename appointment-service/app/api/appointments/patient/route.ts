import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

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
    if (!decoded) {
      return Response.json(
        { message: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (decoded.role !== "patient") {
      return Response.json(
        { message: "Only patients can view patient appointments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const appointments = await Appointment.find({
      patientId: decoded.userId,
    }).sort({ createdAt: -1 });

    return Response.json(
      { message: "Patient appointments fetched successfully", appointments },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get patient appointments error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}