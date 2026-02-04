import { supabase } from "../supabase_client.js";

// Get elements
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const messageDiv = document.getElementById("message");

// Show message
function showMessage(text, isError = false) {
  messageDiv.textContent = text;
  messageDiv.className = `mb-4 p-3 rounded-lg text-sm text-center ${
    isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
  }`;
  messageDiv.classList.remove("hidden");

  setTimeout(() => {
    messageDiv.classList.add("hidden");
  }, 5000);
}

// Handle login
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please enter both email and password", true);
    return;
  }

  // Disable button during request
  submitBtn.disabled = true;
  submitBtn.textContent = "جاري التحميل... / Loading...";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    showMessage("تم تسجيل الدخول بنجاح / Login successful!");

    // Redirect after 1 second
    setTimeout(() => {
      window.location.href = "./../staff"; // Your dashboard page
    }, 1000);
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "تسجيل الدخول / Login";
  }
});

// Check if user is already logged in
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    // User is already logged in, redirect to dashboard
    window.location.href = "./../staff"; // Your dashboard page
  }
});
