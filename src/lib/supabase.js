import { createClient } from "@supabase/supabase-js";

// Updated with the correct anon key
const supabaseUrl = "https://nslkxjzddnjpouzkevii.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbGt4anpkZG5qcG91emtldmlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDA0MjgsImV4cCI6MjA1ODA3NjQyOH0.DP3uywujLW1JzVBOVi3g5M4LKZ4ZzwqtQIGgmWFdMms";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
