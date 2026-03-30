import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ patientId: string }> }
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
        { message: "Only doctors can view patient medical reports" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { patientId } = await context.params;

    const profile = await PatientProfile.findOne({ userId: patientId });

    if (!profile) {
      return Response.json(
        { message: "Patient profile not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      {
        message: "Patient medical reports fetched successfully",
        reports: profile.medicalReports || [],
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Doctor get patient reports error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}