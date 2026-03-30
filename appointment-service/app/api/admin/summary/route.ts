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
    if (!decoded || decoded.role !== "admin") {
      return Response.json(
        { message: "Only admin can view summary" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: "pending" });
    const acceptedAppointments = await Appointment.countDocuments({ status: "accepted" });
    const rejectedAppointments = await Appointment.countDocuments({ status: "rejected" });
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });

    return Response.json(
      {
        message: "Appointment summary fetched successfully",
        summary: {
          totalAppointments,
          pendingAppointments,
          acceptedAppointments,
          rejectedAppointments,
          completedAppointments,
          cancelledAppointments,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Appointment summary error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}