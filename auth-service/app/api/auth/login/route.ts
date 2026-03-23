import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import User from "@/models/User";
import { corsHeaders } from "@/lib/cors";

type LoginBody = {
  email?: string;
  password?: string;
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

    const body: LoginBody = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = generateToken({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return Response.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}