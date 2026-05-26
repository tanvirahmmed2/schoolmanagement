import { NextResponse } from "next/server";
import { findUserByVerificationToken, markUserAsVerified } from "@/lib/auth";
import { env } from "@/lib/env";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${env.APP_URL}/login?error=invalid-token`);
  }

  try {
    const user = await findUserByVerificationToken(token);
    
    if (!user) {
      return NextResponse.redirect(`${env.APP_URL}/login?error=invalid-token`);
    }

    if (user.is_verified) {
      return NextResponse.redirect(`${env.APP_URL}/login?verified=true`);
    }

    const expiryDate = new Date(user.verification_expires);
    if (expiryDate < new Date()) {
      return NextResponse.redirect(`${env.APP_URL}/login?error=token-expired`);
    }

    await markUserAsVerified(user.id);

    return NextResponse.redirect(`${env.APP_URL}/login?verified=true`);
  } catch (error) {
    console.error("[Verification API Error]", error);
    return NextResponse.redirect(`${env.APP_URL}/login?error=server-error`);
  }
}
