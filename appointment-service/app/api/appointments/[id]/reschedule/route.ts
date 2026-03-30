import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

type RescheduleBody = {
  appointmentDate?: string;
  appointmentTime?: string;
};

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
    const body: RescheduleBody = await req.json();

    if (!body.appointmentDate || !body.appointmentTime) {
      return Response.json(
        { message: "appointmentDate and appointmentTime are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    let appointment = null;

    if (decoded.role === "patient") {
      appointment = await Appointment.findOneAndUpdate(
        { _id: id, patientId: decoded.userId, status: { $ne: "cancelled" } },
        {
          $set: {
            appointmentDate: body.appointmentDate,
            appointmentTime: body.appointmentTime,
            status: "pending",
          },
        },
        { returnDocument: "after" }
      );
    } else if (decoded.role === "doctor") {
      appointment = await Appointment.findOneAndUpdate(
        { _id: id, doctorId: decoded.userId, status: { $ne: "cancelled" } },
        {
          $set: {
            appointmentDate: body.appointmentDate,
            appointmentTime: body.appointmentTime,
            status: "pending",
          },
        },
        { returnDocument: "after" }
      );
    } else {
      return Response.json(
        { message: "Only patients or doctors can reschedule appointments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    if (!appointment) {
      return Response.json(
        { message: "Appointment not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      { message: "Appointment rescheduled successfully", appointment },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}