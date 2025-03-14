"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RoleBasedRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function fetchAndRedirect() {
      if (isLoaded && isSignedIn && user) {
        const email = user.primaryEmailAddress.emailAddress;
        try {
          const res = await fetch(`/api/user/role?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data.error) {
            console.error("Error fetching role:", data.error);
            router.push("/student"); // fallback
          } else {
            if (data.role === "admin") {
              router.push("/admin");
            } else if (data.role === "guard") {
              router.push("/guard");
            } else {
              router.push("/student");
            }
          }
        } catch (err) {
          console.error(err);
          router.push("/student");
        }
      }
    }
    fetchAndRedirect();
  }, [isLoaded, isSignedIn, user, router]);

  return <div>Redirecting based on your role...</div>;
}
