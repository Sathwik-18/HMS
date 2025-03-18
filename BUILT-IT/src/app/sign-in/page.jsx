"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

export default function SignInPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/role-redirect`
        }
      });
      
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err) {
      setErrorMsg("An error occurred during sign in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-900 to-white-500 p-4">
      <div className="w-full max-w-md relative">
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl"></div>
        
        <div className="relative p-8 z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-white/80 mt-2">Sign in to continue</p>
          </div>
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{errorMsg}</p>
            </div>
          )}
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all py-4 px-6 rounded-xl shadow-lg hover:shadow-xl"
          >
            <FcGoogle className="text-2xl" />
            <span className="font-medium text-gray-800">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}