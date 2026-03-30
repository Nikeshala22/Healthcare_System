import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import TelemedicineSession from "@/models/TelemedicineSession";

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
    if (!decoded) {
      return Response.json(
        { message: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (decoded.role !== "patient") {
      return Response.json(
        { message: "Only patients can view patient sessions" },
        { status: 403, headers: corsHeaders() }
      );
    }

    console.log("PATIENT TOKEN USER ID:", decoded.userId);

    const allSessions = await TelemedicineSession.find();
    //console.log("ALL TELEMEDICINE SESSIONS:", allSessions);

    const sessions = await TelemedicineSession.find({
      patientId: decoded.userId,
    }).sort({ createdAt: -1 });

    console.log("MATCHED PATIENT SESSIONS:", sessions);

    return Response.json(
      {
        message: "Patient sessions fetched successfully",
        sessions,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get patient sessions error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}