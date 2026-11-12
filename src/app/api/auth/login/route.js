import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.js";
import User from "@/models/User.js";
import { verifyPassword, createSessionToken, createSessionCookie } from "@/lib/session.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userData = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      merchantKey: user.merchantKey,
    };

    const token = createSessionToken(userData);
    const cookieHeader = createSessionCookie(token);

    const response = NextResponse.json(
      { success: true, user: userData },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
