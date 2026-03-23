import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";
import { corsHeaders } from "@/lib/cors";

type ReportBody = {
  title?: string;
  fileUrl?: string;
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
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
        { message: "Only patients can upload reports" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: ReportBody = await req.json();
    const { title, fileUrl } = body;

    if (!title || !fileUrl) {
      return Response.json(
        { message: "Title and fileUrl are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $push: {
          medicalReports: {
            title,
            fileUrl,
            uploadedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    if (!profile) {
      return Response.json(
        { message: "Profile not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      {
        message: "Medical report uploaded successfully",
        reports: profile.medicalReports,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Upload report error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
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
        message: "Medical reports fetched successfully",
        reports: profile.medicalReports,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get reports error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}