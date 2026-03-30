import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    let appointment = null;

    if (decoded.role === "patient") {
      appointment = await Appointment.findOne({
        _id: id,
        patientId: decoded.userId,
      });
    } else if (decoded.role === "doctor") {
      appointment = await Appointment.findOne({
        _id: id,
        doctorId: decoded.userId,
      });
    } else {
      return Response.json(
        { message: "Only patients or doctors can cancel appointments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (!appointment) {
      return Response.json(
        { message: "Appointment not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (appointment.status === "cancelled") {
      return Response.json(
        { message: "Appointment is already cancelled" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (appointment.status === "completed") {
      return Response.json(
        { message: "Completed appointments cannot be cancelled" },
        { status: 400, headers: corsHeaders() }
      );
    }

    appointment.status = "cancelled";
    await appointment.save();

    return Response.json(
      { message: "Appointment cancelled successfully", appointment },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}