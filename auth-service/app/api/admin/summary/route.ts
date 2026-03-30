import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import User from "@/models/User";

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

    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    return Response.json(
      {
        message: "Auth summary fetched successfully",
        summary: {
          totalPatients,
          totalDoctors,
          totalAdmins,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Auth summary error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}