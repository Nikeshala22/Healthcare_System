import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import DoctorProfile from "@/models/DoctorProfile";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty") || "";

    const doctors = await DoctorProfile.find({
      specialty: { $regex: specialty, $options: "i" },
    });

    return Response.json(
      { message: "Doctor search successful", doctors },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Search doctors error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders() });
  }
}