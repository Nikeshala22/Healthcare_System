import jwt, { JwtPayload as DefaultJwtPayload, Secret } from "jsonwebtoken";

export type UserRole = "patient" | "doctor" | "admin";

export interface AppJwtPayload extends DefaultJwtPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

const jwtSecret: Secret = JWT_SECRET;

export function verifyToken(token: string): AppJwtPayload | null {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === "string") return null;
    return decoded as AppJwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}