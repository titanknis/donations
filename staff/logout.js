import { supabase } from "../supabase_client.js";

// Logout function
async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("خطأ في تسجيل الخروج / Logout error");
      return;
    }

    // Redirect to login page
    window.location.href = "./../login"; // or wherever your login page is
  } catch (error) {
    console.error("Logout error:", error);
    alert("خطأ في تسجيل الخروج / Logout error");
  }
}

// Make logout function available globally
window.logout = logout;

// Display current user info
async function displayUserInfo() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const userEmail = session.user.email;
    const userName = document.getElementById("userName");

    if (userName) {
      userName.textContent = userEmail;
    }
  } else {
    // No session, redirect to login
    window.location.href = "./../login";
  }
}

// Check if user is logged in when page loads
displayUserInfo();
