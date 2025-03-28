import supabase from "../../supabase";

async function getUserID() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError || !sessionData?.session) {
    console.error(
      "Error fetching session or no active session found:",
      sessionError?.message
    );
    return null;
  }

  const userId = sessionData.session.user.id;
  return userId;
}

export default getUserID;
