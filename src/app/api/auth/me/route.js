import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session.js";

export async function GET(request) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      merchantKey: user.merchantKey,
    },
  });
}
