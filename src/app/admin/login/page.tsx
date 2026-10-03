"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("Signing in...");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      setMessage("Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>
        <h1>Admin Login</h1>
        <p className="subtitle">
          Sign in to review student submissions.
        </p>
      </header>

      <section className="designer">
        <form className="submission-form" onSubmit={handleLogin}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="send-button" type="submit">
            Sign In →
          </button>

          {message && <p>{message}</p>}
        </form>
      </section>
    </main>
  );
}