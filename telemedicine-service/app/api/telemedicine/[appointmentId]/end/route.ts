import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import TelemedicineSession from "@/models/TelemedicineSession";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ appointmentId: string }> }
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

    const { appointmentId } = await context.params;

    const session = await TelemedicineSession.findOne({ appointmentId });

    if (!session) {
      return Response.json(
        { message: "Session not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (
      decoded.userId !== session.doctorId &&
      decoded.role !== "admin"
    ) {
      return Response.json(
        { message: "Only doctor or admin can end session" },
        { status: 403, headers: corsHeaders() }
      );
    }

    session.status = "ended";
    await session.save();

    return Response.json(
      { message: "Session ended successfully", session },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("End session error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}