import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import { sendEmail } from "@/lib/email";
import Notification from "@/models/Notification";

type Body = {
  patient: {
    userId: string;
    name: string;
    email: string;
  };
  doctor: {
    userId: string;
    name: string;
    email: string;
  };
  appointmentDate: string;
  appointmentTime: string;
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: Body = await req.json();

    const doctorMessage = `A new appointment with ${body.patient.name} is booked for ${body.appointmentDate} at ${body.appointmentTime}.`;

    let doctorEmailStatus = "sent";

    try {
      await sendEmail(
        body.doctor.name,
        body.doctor.email,
        "New Appointment Booking",
        doctorMessage
      );
      console.log("Doctor booking email sent to:", body.doctor.email);
    } catch (error) {
      console.error("Doctor booking email failed:", error);
      doctorEmailStatus = "failed";
    }

    await Notification.create({
      userId: body.doctor.userId,
      recipientName: body.doctor.name,
      recipientEmail: body.doctor.email,
      type: "appointment_booked",
      subject: "New Appointment Booking",
      message: doctorMessage,
      emailStatus: doctorEmailStatus,
    });

    return Response.json(
      { message: "Doctor booking email processed successfully" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Send booking notification error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}