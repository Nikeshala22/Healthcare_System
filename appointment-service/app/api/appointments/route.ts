import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Appointment from "@/models/Appointment";

type AppointmentBody = {
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  consultationFee?: number;
  doctorEmail?: string;
  doctorPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req: Request) {
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
        { message: "Only patients can book appointments" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: AppointmentBody = await req.json();

    if (
      !body.doctorId ||
      !body.doctorName ||
      !body.specialty ||
      body.consultationFee === undefined ||
      !body.doctorEmail ||
      !body.appointmentDate ||
      !body.appointmentTime
    ) {
      return Response.json(
        {
          message:
            "doctorId, doctorName, specialty, consultationFee, doctorEmail, appointmentDate, appointmentTime are required",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const appointment = await Appointment.create({
      patientId: decoded.userId,
      patientName: decoded.name,
      patientEmail: decoded.email,
      patientPhone: decoded.phone || "",
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      doctorEmail: body.doctorEmail,
      doctorPhone: body.doctorPhone || "",
      specialty: body.specialty,
      consultationFee: body.consultationFee,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      reason: body.reason || "",
      status: "pending",
      notes: "",
    });

    try {
      await fetch("http://localhost:3007/api/notifications/send-booking", {
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
      console.log("Doctor booking email notification sent");
    } catch (error) {
      console.error("Booking notification call failed:", error);
    }

    return Response.json(
      { message: "Appointment booked successfully", appointment },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Book appointment error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}