import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.js";
import User from "@/models/User.js";
import { generateSalt, hashPassword, createSessionToken, createSessionCookie } from "@/lib/session.js";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "buyer", merchantKey } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const userId = "usr_" + crypto.randomBytes(8).toString("hex");

    const newUser = await User.create({
      userId,
      email: normalizedEmail,
      name: name.trim(),
      role: role === "seller" ? "seller" : "buyer",
      passwordHash,
      passwordSalt: salt,
      merchantKey: role === "seller" ? merchantKey || `merchant-${userId}` : null,
    });

    const userData = {
      userId: newUser.userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      merchantKey: newUser.merchantKey,
    };

    const token = createSessionToken(userData);
    const cookieHeader = createSessionCookie(token);

    const response = NextResponse.json(
      { success: true, user: userData },
      { status: 201 }
    );
    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    );
  }
}
