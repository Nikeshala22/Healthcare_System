import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { corsHeaders } from "@/lib/cors";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: "patient" | "doctor" | "admin";
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

    const body: RegisterBody = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email, and password are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return Response.json(
        { message: "User already exists" },
        { status: 409, headers: corsHeaders() }
      );
    }

    const safeRole: "patient" | "doctor" =
      role === "doctor" ? "doctor" : "patient";

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
    });

    return Response.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}