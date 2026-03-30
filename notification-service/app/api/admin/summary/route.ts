import { connectDB } from "@/lib/db";
import { corsHeaders } from "@/lib/cors";
import Notification from "@/models/Notification";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

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

    const totalNotifications = await Notification.countDocuments();
    const sentNotifications = await Notification.countDocuments({ emailStatus: "sent" });
    const failedNotifications = await Notification.countDocuments({ emailStatus: "failed" });
    const pendingNotifications = await Notification.countDocuments({ emailStatus: "pending" });

    return Response.json(
      {
        message: "Notification summary fetched successfully",
        summary: {
          totalNotifications,
          sentNotifications,
          failedNotifications,
          pendingNotifications,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Notification summary error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}