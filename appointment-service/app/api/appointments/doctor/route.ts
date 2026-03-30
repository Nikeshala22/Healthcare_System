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

    if (decoded.role !== "doctor") {
      return Response.json(
        { message: "Only doctors can view doctor appointments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const appointments = await Appointment.find({
      doctorId: decoded.userId,
    }).sort({ createdAt: -1 });

    return Response.json(
      { message: "Doctor appointments fetched successfully", appointments },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}