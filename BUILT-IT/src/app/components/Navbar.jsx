"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [homePath, setHomePath] = useState("/");
  const router = useRouter();
  const profileRef = useRef(null);

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

  // Close profile dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render links based on role
  const renderLinks = () => {
    if (!session) {
      return (
        <li className={styles.navItem}>
          <Link href="/sign-in" className={styles.navLink}>Sign In</Link>
        </li>
      );
    }
    if (role === "admin") {
      return (
        <>
          <li className={styles.navItem}>
            <Link href="/admin" className={styles.navLink}>
              <FaHome className={styles.homeIcon} /> Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/students-data" className={styles.navLink}>Students Data</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/spreadsheet-integration" className={styles.navLink}>Upload Data</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/maintenance-tracking" className={styles.navLink}>Maintenance</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/room-request-tracking" className={styles.navLink}>Room Requests</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/notification-management" className={styles.navLink}>Notifications</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin/feedback" className={styles.navLink}>Feedbacks</Link>
          </li>
        </>
      );
    } else if (role === "student") {
      return (
        <>
          <li className={styles.navItem}>
            <Link href="/student" className={styles.navLink}>
              <FaHome className={styles.homeIcon} /> Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/student/profile" className={styles.navLink}>Profile</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/student/complaints" className={styles.navLink}>Complaints</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/student/room-change-request" className={styles.navLink}>Room Change</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/student/feedback" className={styles.navLink}>Feedback</Link>
          </li>
        </>
      );
    } else if (role === "guard") {
      return (
        <>
          <li className={styles.navItem}>
            <Link href="/guard" className={styles.navLink}>
              <FaHome className={styles.homeIcon} /> Home
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/guard/check-in-out" className={styles.navLink}>Check-In/Out</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/guard/visitor-management" className={styles.navLink}>Visitor Management</Link>
          </li>
        </>
      );
    } else {
      return (
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>Home</Link>
        </li>
      );
    }
  };

  const avatarUrl = userData?.user_metadata?.avatar_url;
  const fullName = userData?.user_metadata?.full_name;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <Link href={homePath} className={styles.logoLink}>
          <img src="/logo.png" alt="IIT Indore Logo" className={styles.logo} />
          <span className={styles.brandName}>HMS - IIT Indore</span>
        </Link>
      </div>
      <div className={styles.navbarRight}>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          {renderLinks()}
        </ul>
        {session && (
          <div ref={profileRef} className={styles.profileContainer}>
            <div 
              className={styles.profileIcon} 
              onClick={() => setProfileOpen(!profileOpen)}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className={styles.profilePic} />
              ) : (
                <div className={styles.profilePicFallback}>
                  {userData?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profileOpen && (
              <div className={styles.profileDropdown}>
                <p className={styles.profileName}>{fullName}</p>
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
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <FiMenu className={styles.hamburgerIcon} />
        </button>
      </div>
    </nav>
  );
}
