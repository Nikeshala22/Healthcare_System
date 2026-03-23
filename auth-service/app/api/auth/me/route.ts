import { getTokenFromHeader, verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return Response.json(
        { message: "Authorization token missing" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return Response.json(
      {
        message: "Authorized user",
        user: decoded,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Me route error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}