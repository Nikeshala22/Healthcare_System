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

    const patientMessage = `Your appointment with ${body.doctor.name} has been accepted for ${body.appointmentDate} at ${body.appointmentTime}.`;

    let patientEmailStatus = "sent";

    try {
      await sendEmail(
        body.patient.name,
        body.patient.email,
        "Appointment Accepted",
        patientMessage
      );
      console.log("Patient accepted email sent to:", body.patient.email);
    } catch (error) {
      console.error("Patient accepted email failed:", error);
      patientEmailStatus = "failed";
    }

    await Notification.create({
      userId: body.patient.userId,
      recipientName: body.patient.name,
      recipientEmail: body.patient.email,
      type: "appointment_accepted",
      subject: "Appointment Accepted",
      message: patientMessage,
      emailStatus: patientEmailStatus,
    });

    return Response.json(
      { message: "Patient accepted email processed successfully" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Send accepted notification error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}