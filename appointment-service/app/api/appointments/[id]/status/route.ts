import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

type StatusBody = {
  status?: "accepted" | "rejected" | "completed";
  notes?: string;
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

    if (decoded.role !== "doctor") {
      return Response.json(
        { message: "Only doctors can update appointment status" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { id } = await context.params;
    const body: StatusBody = await req.json();

    if (!body.status) {
      return Response.json(
        { message: "status is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: decoded.userId,
    });

    if (!appointment) {
      return Response.json(
        { message: "Appointment not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (appointment.status === "cancelled") {
      return Response.json(
        { message: "Cancelled appointments cannot be updated" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (appointment.status === "completed") {
      return Response.json(
        { message: "Completed appointments cannot be updated" },
        { status: 400, headers: corsHeaders() }
      );
    }

    appointment.status = body.status;
    appointment.notes = body.notes || "";
    await appointment.save();

    if (body.status === "accepted") {
      try {
        await fetch("http://localhost:3007/api/notifications/send-accepted", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient: {
              userId: appointment.patientId,
              name: appointment.patientName,
              email: appointment.patientEmail,
            },
            doctor: {
              userId: appointment.doctorId,
              name: appointment.doctorName,
              email: appointment.doctorEmail,
            },
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
          }),
        });
        console.log("Patient accepted email sent");
      } catch (error) {
        console.error("Accepted notification call failed:", error);
      }
    }

    if (body.status === "completed") {
      try {
        await fetch("http://localhost:3007/api/notifications/send-completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient: {
              userId: appointment.patientId,
              name: appointment.patientName,
              email: appointment.patientEmail,
            },
            doctor: {
              userId: appointment.doctorId,
              name: appointment.doctorName,
              email: appointment.doctorEmail,
            },
          }),
        });
        console.log("Patient completion email sent");
      } catch (error) {
        console.error("Completion notification call failed:", error);
      }
    }

    return Response.json(
      { message: "Appointment status updated successfully", appointment },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Update appointment status error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}