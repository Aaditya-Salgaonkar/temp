import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase keys
const SUPABASE_URL = "https://mbzjjnszzzwbyngcdqyk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iempqbnN6enp3YnluZ2NkcXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5Njk3NjEsImV4cCI6MjA1ODU0NTc2MX0.BCwHIqvr6k0xDRrzcuNC6jr1G7q1m9QhnLzEl6KEY1k";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hardcoded ID for now
const AGENT_ID = "6d199bdd-3e6c-494a-b617-403133e1a012"; // Replace with the actual agent ID

// Function to fetch finetuning_data
export const fetchFineTuningData = async () => {
  try {
    // Get the currently logged-in user's session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error(
        "Error fetching session or no active session found:",
        sessionError?.message
      );
      return null;
    }

    // Get the logged-in user's ID
    const userId = sessionData.session.user.id;

    // Query the agents table for the specific ID and user_id
    const { data, error } = await supabase
      .from("agents")
      .select("finetuning_data")
      .eq("id", AGENT_ID)
      .eq("user_id", userId) // Ensure the user_id matches the logged-in user's ID
      .single(); // Fetch a single row

    if (error) {
      console.error("Error fetching finetuning_data:", error.message);
      return null;
    }

    console.log("Fetched finetuning_data:", data.finetuning_data);
    return data.finetuning_data; // Return the finetuning_data
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};