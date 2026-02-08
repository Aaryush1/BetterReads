import { createClient } from "@supabase/supabase-js";

// Server-side admin client using service role key (bypasses RLS)
// Only use for embedding writes — never expose to client-side code
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
