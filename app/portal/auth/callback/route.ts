import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowedPortalEmail } from "@/lib/auth/config";

/**
 * OAuth callback — exchanges the Google auth code for a Supabase session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/portal";

  if (!code) {
    return NextResponse.redirect(`${origin}/portal?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/portal?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedPortalEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/portal?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
