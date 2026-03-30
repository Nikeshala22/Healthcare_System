import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";
import { corsHeaders } from "@/lib/cors";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

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

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const file = formData.get("file") as File | null;

    if (!title || !file) {
      return Response.json(
        { message: "Title and PDF file are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { message: "Only PDF files are allowed" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Optional: file size limit (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json(
        { message: "File size must be less than 5MB" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    await mkdir(uploadDir, { recursive: true });

    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/reports/${safeFileName}`;

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $push: {
          medicalReports: {
            title,
            fileUrl,
            originalName: file.name,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
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