import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!form.name || form.name.trim().length < 2) {
      toast.error('Enter your full name');
      return;
    }
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(form.email)) {
      toast.error('Enter a valid email address');
      return;
    }
    // password strength: at least 8 chars, uppercase, lowercase, number
    const pass = form.password || '';
    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass)) {
      toast.error('Password must be 8+ characters and include upper/lowercase letters and a number');
      return;
    }
    try {
      await register(form);
      navigate("/client", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Client registration</p>
          <h1 className="mt-3 text-3xl font-extrabold text-ink-900 dark:text-white">Create your secure consultation workspace</h1>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-100">Registration is for clients only in the demo. After sign-up you can submit inquiries and track appointment status from the client dashboard.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["password", "Password", "password"],
              ["confirmPassword", "Confirm password", "password"]
            ].map(([key, label, type]) => (
              <label key={key} className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
                {label}
                <input
                  type={type}
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950"
                  required={key !== "phone"}
                />
              </label>
            ))}
            <div className="rounded-lg bg-ink-50 p-4 text-sm leading-6 text-ink-600 dark:bg-white/5 dark:text-ink-100 md:col-span-2">
              Your account starts with the client role. Use at least 8 characters with uppercase, lowercase, number, and symbol.
            </div>
            <button disabled={loading} className="focus-ring rounded-lg bg-ink-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-jade-400 dark:text-ink-950 md:col-span-2" type="submit">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-ink-500 dark:text-ink-100">
            Already registered? <Link to="/login" className="font-extrabold text-jade-700 dark:text-jade-100">Sign in</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
