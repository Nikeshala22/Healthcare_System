import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import User from "@/models/User";
import bcrypt from "bcryptjs";

type UpdateUserBody = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: "admin" | "patient" | "doctor";
  phone?: string;
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
        { message: "Only admin can update users" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { id } = await context.params;
    const body: UpdateUserBody = await req.json();

    const updateData: Record<string, any> = {};

    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.phone !== undefined) updateData.phone = body.phone;

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password",
    });

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      { message: "User updated successfully", user },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
        { message: "Only admin can delete users" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const { id } = await context.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return Response.json(
      { message: "User deleted successfully" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}