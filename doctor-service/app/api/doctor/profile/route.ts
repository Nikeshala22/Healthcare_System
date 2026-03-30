import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import DoctorProfile from "@/models/DoctorProfile";

type ProfileBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  qualification?: string;
  hospital?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
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
      return Response.json({ message: "Only doctors can create profiles" }, { status: 403, headers: corsHeaders() });
    }

    const body: ProfileBody = await req.json();

    if (!body.fullName || !body.specialty) {
      return Response.json(
        { message: "fullName and specialty are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const existingProfile = await DoctorProfile.findOne({ userId: decoded.userId });
    if (existingProfile) {
      return Response.json(
        { message: "Doctor profile already exists" },
        { status: 409, headers: corsHeaders() }
      );
    }

    const profile = await DoctorProfile.create({
      userId: decoded.userId,
      fullName: body.fullName,
      email: body.email || decoded.email,
      phone: body.phone || "",
      specialty: body.specialty,
      qualification: body.qualification || "",
      hospital: body.hospital || "",
      experience: body.experience || 0,
      bio: body.bio || "",
      consultationFee: body.consultationFee || 0,
      availability: [],
    });

    return Response.json(
      { message: "Doctor profile created successfully", profile },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Create doctor profile error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
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
      { message: "Doctor profile fetched successfully", profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get doctor profile error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(req: Request) {
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
      return Response.json({ message: "Only doctors can update profiles" }, { status: 403, headers: corsHeaders() });
    }

    const body: ProfileBody = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.specialty !== undefined) updateData.specialty = body.specialty;
    if (body.qualification !== undefined) updateData.qualification = body.qualification;
    if (body.hospital !== undefined) updateData.hospital = body.hospital;
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.consultationFee !== undefined) updateData.consultationFee = body.consultationFee;

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: decoded.userId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!profile) {
      return Response.json({ message: "Doctor profile not found" }, { status: 404, headers: corsHeaders() });
    }

    return Response.json(
      { message: "Doctor profile updated successfully", profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Update doctor profile error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}