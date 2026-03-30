import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import DoctorProfile from "@/models/DoctorProfile";

type AvailabilitySlot = {
  day: string;
  startTime: string;
  endTime: string;
};

type AvailabilityBody = {
  availability?: AvailabilitySlot[];
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeader(req);
    if (!token) {
      return Response.json({ message: "Token missing" }, { status: 401, headers: corsHeaders() });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401, headers: corsHeaders() });
    }

    const profile = await DoctorProfile.findOne({ userId: decoded.userId });
    if (!profile) {
      return Response.json({ message: "Doctor profile not found" }, { status: 404, headers: corsHeaders() });
    }

    return Response.json(
      { message: "Availability fetched successfully", availability: profile.availability },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get availability error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = getTokenFromHeader(req);
    if (!token) {
      return Response.json({ message: "Token missing" }, { status: 401, headers: corsHeaders() });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401, headers: corsHeaders() });
    }

    if (decoded.role !== "doctor") {
      return Response.json({ message: "Only doctors can set availability" }, { status: 403, headers: corsHeaders() });
    }

    const body: AvailabilityBody = await req.json();
    const availability = body.availability || [];

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: decoded.userId },
      { $set: { availability } },
      { returnDocument: "after" }
    );

    if (!profile) {
      return Response.json({ message: "Doctor profile not found" }, { status: 404, headers: corsHeaders() });
    }

    return Response.json(
      { message: "Availability updated successfully", availability: profile.availability },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Set availability error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}