import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

type StatusBody = {
  status?: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
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

    if (decoded.role !== "doctor" && decoded.role !== "admin") {
      return Response.json(
        { message: "Only doctor or admin can update appointment status" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { id } = await context.params;
    const body: StatusBody = await req.json();

    if (!body.status) {
      return Response.json(
        { message: "Status is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return Response.json(
        { message: "Appointment not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (decoded.role === "doctor" && appointment.doctorId !== decoded.userId) {
      return Response.json(
        { message: "Not authorized to update this appointment" },
        { status: 403, headers: corsHeaders() }
      );
    }

    appointment.status = body.status;
    appointment.notes = body.notes || appointment.notes;

    await appointment.save();

    const notificationServiceUrl =
      process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:3007";

    if (body.status === "accepted") {
      try {
        const response = await fetch(
          `${notificationServiceUrl}/api/notifications/send-accepted`,
          {
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
              status: appointment.status,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Accepted notification service error:", errorText);
        } else {
          console.log("Accepted notification sent successfully");
        }
      } catch (error) {
        console.error("Accepted notification call failed:", error);
      }
    }

    if (body.status === "completed") {
      try {
        const response = await fetch(
          `${notificationServiceUrl}/api/notifications/send-completion`,
          {
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
              status: appointment.status,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Completion notification service error:", errorText);
        } else {
          console.log("Completion notification sent successfully");
        }
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