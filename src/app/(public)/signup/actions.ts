"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(
  prevState: { error: string | null },
  formData: FormData
) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase doesn't error on duplicate emails (to prevent enumeration).
  // Instead it returns a user with an empty identities array.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "An account with this email already exists. Please sign in instead.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/signup/check-email");
}
