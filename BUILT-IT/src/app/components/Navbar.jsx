"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [homePath, setHomePath] = useState("/"); // New state variable for home redirection
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        setUserData(session.user);
        const email = session.user.email;
        try {
          const res = await fetch(`/api/user/role?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data.error) {
            console.error("Error fetching role:", data.error);
            setRole(null);
            setHomePath("/");
          } else {
            setRole(data.role);
            if (data.role === "admin") setHomePath("/admin");
            else if (data.role === "student") setHomePath("/student");
            else if (data.role === "guard") setHomePath("/guard");
            else setHomePath("/");
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setRole(null);
          setHomePath("/");
        }
      }
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserData(session ? session.user : null);
      if (session) {
        const email = session.user.email;
        fetch(`/api/user/role?email=${encodeURIComponent(email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              console.error("Error fetching role:", data.error);
              setRole(null);
              setHomePath("/");
            } else {
              setRole(data.role);
              if (data.role === "admin") setHomePath("/admin");
              else if (data.role === "student") setHomePath("/student");
              else if (data.role === "guard") setHomePath("/guard");
              else setHomePath("/");
            }
          })
          .catch((err) => {
            console.error("Error fetching role:", err);
            setRole(null);
            setHomePath("/");
          });
      } else {
        setRole(null);
        setHomePath("/");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Redirect user based on role
  useEffect(() => {
    if (role) {
      router.push(homePath);
    }
  }, [role, homePath, router]);

  // Render links based on role
  const renderLinks = () => {
    if (!session) {
      return (
        <li>
          <Link href="/sign-in">Sign In</Link>
        </li>
      );
    }
    if (role === "admin") {
      return (
        <>
          <li><Link href="/admin">Home</Link></li>
          <li><Link href="/admin/students-data">Students Data</Link></li>
          <li><Link href="/admin/spreadsheet-integration">Upload Data</Link></li>
          <li><Link href="/admin/maintenance-tracking">Maintenance</Link></li>
          <li><Link href="/admin/room-request-tracking">Room Requests</Link></li>
          <li><Link href="/admin/notification-management">Notifications</Link></li>
          <li><Link href="/admin/feedback">Feedbacks</Link></li>
        </>
      );
    } else if (role === "student") {
      return (
        <>
          <li><Link href="/student">Home</Link></li>
          <li><Link href="/student/profile">Profile</Link></li>
          <li><Link href="/student/complaints">Complaints</Link></li>
          <li><Link href="/student/room-change-request">Room Change</Link></li>
          <li><Link href="/student/feedback">Feedback</Link></li>
        </>
      );
    } else if (role === "guard") {
      return (
        <>
          <li><Link href="/guard/check-in-out">Home</Link></li>
          <li><Link href="/guard/visitor-management">Visitor Management</Link></li>
        </>
      );
    } else {
      return (
        <li>
          <Link href="/">Home</Link>
        </li>
      );
    }
  };

  return (
    <nav className={styles.navbar}>
      {/* Left Side: Logo & Brand */}
      <div className={styles.navbarLeft}>
        <Link href={homePath} className={styles.logoLink}>
          <img src="/logo.png" alt="IIT Indore Logo" className={styles.logo} />
          <span className={styles.brandName}>HMS - IIT Indore</span>
        </Link>
      </div>
      {/* Right Side: Navigation Links & Auth */}
      <div className={styles.navbarRight}>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          {renderLinks()}
        </ul>
        {session && (
          <div className={styles.profileContainer}>
            <div 
              className={styles.profileIcon} 
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ cursor: "pointer" }}
            >
              {userData?.user_metadata?.avatar_url ? (
                <img
                  src={userData.user_metadata.avatar_url}
                  alt="Profile"
                  className={styles.profilePic}
                />
              ) : (
                <div className={styles.profilePicFallback}>
                  {userData?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profileOpen && (
              <div className={styles.profileDropdown}>
                <p className={styles.profileEmail}>{userData.email}</p>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                    router.push("/sign-in");
                  }}
                  className={styles.signOutButton}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
        {/* Hamburger for Mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>
    </nav>
  );
}
