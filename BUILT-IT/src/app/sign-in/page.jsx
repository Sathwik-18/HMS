"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Error signing in with Google:", error.message);
    } else {
      router.push("/role-redirect");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login with institute email</h1>
        <p style={styles.subtitle}>Please use official insitute email to sign in</p>
        <button onClick={handleGoogleSignIn} style={styles.googleButton}>
          <FcGoogle size={24} style={{ marginRight: "8px" }} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundImage: "url('/background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  },
  card: {
    backdropFilter: "blur(10px)",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
    textAlign: "center",
    width: "320px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#fff",
    marginTop: "1rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#e0e0e0",
    marginBottom: "1.5rem",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    backgroundColor: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#333",
    width: "100%",
  },
};
