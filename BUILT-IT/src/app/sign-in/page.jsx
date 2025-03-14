"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/role-redirect"); // Redirect based on role
    }
  };

  return (
    <div style={styles.container}>
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
        <button type="submit" style={styles.button}>Sign In</button>
      </form>
      <div style={{ margin: "1rem 0" }}>
        <GoogleSignInButton />
      </div>
      <p style={{ marginTop: "1rem" }}>
        Don't have an account? <Link href="/sign-up">Sign Up</Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    justifyContent: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: "1rem", width: "300px" },
  input: { padding: "0.75rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px" },
  button: { padding: "0.75rem", backgroundColor: "#1c2f58", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red" },
};
