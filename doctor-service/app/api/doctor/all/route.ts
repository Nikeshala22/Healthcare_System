import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import DoctorProfile from "@/models/DoctorProfile";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  try {
    await connectDB();

    const doctors = await DoctorProfile.find().sort({ createdAt: -1 });

    return Response.json(
      { message: "Doctors fetched successfully", doctors },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get all doctors error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}