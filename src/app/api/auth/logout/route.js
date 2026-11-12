import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session.js";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
