import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import PatientProfile from "@/models/PatientProfile";
import { corsHeaders } from "@/lib/cors";

type CreateProfileBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
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
        { message: "Only patients can create profiles" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: CreateProfileBody = await req.json();

    const existingProfile = await PatientProfile.findOne({ userId: decoded.userId });
    if (existingProfile) {
      return Response.json(
        { message: "Profile already exists" },
        { status: 409, headers: corsHeaders() }
      );
    }

    const profile = await PatientProfile.create({
      userId: decoded.userId,
      fullName: body.fullName || decoded.name,
      email: body.email || decoded.email,
      phone: body.phone || "",
      age: body.age || 0,
      gender: body.gender || "",
      address: body.address || "",
      bloodGroup: body.bloodGroup || "",
      emergencyContact: body.emergencyContact || "",
      medicalReports: [],
      medicalHistory: [],
      prescriptions: [],
    });

    return Response.json(
      { message: "Patient profile created successfully", profile },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Create profile error:", error);
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
      { message: "Patient profile fetched successfully", profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(req: Request) {
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
        { message: "Only patients can update profiles" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: CreateProfileBody = await req.json();

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: {
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          age: body.age,
          gender: body.gender,
          address: body.address,
          bloodGroup: body.bloodGroup,
          emergencyContact: body.emergencyContact,
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
      { message: "Patient profile updated successfully", profile },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}