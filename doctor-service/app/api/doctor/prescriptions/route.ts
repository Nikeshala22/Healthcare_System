import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import Prescription from "@/models/Prescription";

type PrescriptionBody = {
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  diagnosis?: string;
  medicines?: string;
  instructions?: string;
  notes?: string;
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
    if (!decoded || decoded.role !== "doctor") {
      return Response.json(
        { message: "Only doctors can create prescriptions" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: PrescriptionBody = await req.json();

    if (
      !body.appointmentId ||
      !body.patientId ||
      !body.patientName ||
      !body.diagnosis ||
      !body.medicines ||
      !body.instructions
    ) {
      return Response.json(
        {
          message:
            "appointmentId, patientId, patientName, diagnosis, medicines, instructions are required",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    const prescription = await Prescription.create({
      appointmentId: body.appointmentId,
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: decoded.userId,
      doctorName: decoded.name,
      diagnosis: body.diagnosis,
      medicines: body.medicines,
      instructions: body.instructions,
      notes: body.notes || "",
    });

    return Response.json(
      { message: "Prescription created successfully", prescription },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Create prescription error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}