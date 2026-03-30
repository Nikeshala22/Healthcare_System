import { connectDB } from "@/lib/db";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";
import { corsHeaders } from "@/lib/cors";
import User from "@/models/User";
import bcrypt from "bcryptjs";

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: "admin" | "patient" | "doctor";
  phone?: string;
};

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
        { message: "Only admin can view users" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    return Response.json(
      { message: "Users fetched successfully", users },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Admin users GET error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
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
    if (!decoded || decoded.role !== "admin") {
      return Response.json(
        { message: "Only admin can create users" },
        { status: 403, headers: corsHeaders() }
      );
    }

    const body: CreateUserBody = await req.json();

    if (!body.name || !body.email || !body.password || !body.role) {
      return Response.json(
        { message: "name, email, password, role are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return Response.json(
        { message: "Email already exists" },
        { status: 409, headers: corsHeaders() }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
    });

    return Response.json(
      {
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Admin users POST error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}