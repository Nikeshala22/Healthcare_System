import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import TelemedicineSession from "@/models/TelemedicineSession";

type SessionBody = {
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
};

function generateJitsiLink(appointmentId: string) {
  return `https://meet.jit.si/healthcare-${appointmentId}`;
}

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

    if (decoded.role !== "doctor" && decoded.role !== "admin") {
      return Response.json(
        { message: "Only doctor or admin can create telemedicine sessions" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: SessionBody = await req.json();

    if (
      !body.appointmentId ||
      !body.patientId ||
      !body.patientName ||
      !body.scheduledDate ||
      !body.scheduledTime
    ) {
      return Response.json(
        {
          message:
            "appointmentId, patientId, patientName, scheduledDate, scheduledTime are required",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const existing = await TelemedicineSession.findOne({
      appointmentId: body.appointmentId,
    });

    if (existing) {
      return Response.json(
        { message: "Session already exists for this appointment" },
        { status: 409, headers: corsHeaders() }
      );
    }

    const session = await TelemedicineSession.create({
      appointmentId: body.appointmentId,
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: decoded.userId,
      doctorName: decoded.name,
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      sessionLink: generateJitsiLink(body.appointmentId),
      status: "scheduled",
    });

    return Response.json(
      { message: "Telemedicine session created successfully", session },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Create telemedicine session error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}