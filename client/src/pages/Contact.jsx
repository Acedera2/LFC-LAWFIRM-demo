import { Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Contact() {
  const submit = (event) => {
    event.preventDefault();
    toast.success("Message queued for intake staff");
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <section>
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900 dark:text-white sm:text-5xl">Talk with the intake team.</h1>
          <p className="mt-6 text-lg leading-8 text-ink-600 dark:text-ink-100">Send a general inquiry or create a secure account to book and track a consultation.</p>
          <div className="mt-8 grid gap-4 text-sm text-ink-600 dark:text-ink-100">
            <span className="flex items-center gap-3"><MapPin size={18} /> Occidental Mindoro Provincial Capitol</span>
            <span className="flex items-center gap-3"><Phone size={18} /> +63 45 123 4567</span>
            <span className="flex items-center gap-3"><Mail size={18} /> concierge@lfcfirm.com</span>
          </div>
        </section>
        <form onSubmit={submit} className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Full name
              <input required className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Email
              <input required type="email" className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
            Message
            <textarea required rows="6" className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950" />
          </label>
          <button className="focus-ring mt-5 rounded-lg bg-ink-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 dark:bg-jade-400 dark:text-ink-950" type="submit">
            Send inquiry
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
