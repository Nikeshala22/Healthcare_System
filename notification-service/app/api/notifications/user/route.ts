import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import Notification from "@/models/Notification";

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return Response.json(
        { message: "Missing x-user-id header" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    return Response.json(
      { notifications },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}