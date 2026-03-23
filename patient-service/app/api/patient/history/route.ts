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

    const profile = await PatientProfile.findOne({ userId: decoded.userId });

    if (!profile) {
      return Response.json(
        { message: "Profile not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      {
        message: "Medical history fetched successfully",
        history: profile.medicalHistory,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get history error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}