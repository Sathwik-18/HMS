"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [dbRole, setDbRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // When user info is loaded, fetch role from your API based on their email.
  useEffect(() => {
    async function fetchUserRole() {
      if (isSignedIn && user) {
        const email = user.primaryEmailAddress.emailAddress;
        try {
          const res = await fetch(`/api/user/role?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (data.error) {
            console.error("Error fetching role:", data.error);
            setDbRole(null);
          } else {
            setDbRole(data.role);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
          setDbRole(null);
        } finally {
          setLoadingRole(false);
        }
      } else {
        setLoadingRole(false);
      }
    }
    fetchUserRole();
  }, [isSignedIn, user]);

  // Determine home link based on the DB role (fallback to Clerk meta if needed)
  const homeLink = isSignedIn
    ? dbRole === "student"
      ? "/student"
      : dbRole === "admin"
      ? "/admin"
      : dbRole === "guard"
      ? "/guard"
      : "/"
    : "/";

  return (
    <nav className={styles.navbar}>
      {/* Left side: Logo & Brand */}
      <div className={styles.navbarLeft}>
        <Link href={homeLink} className={styles.logoLink}>
          <img src="/logo.png" alt="IIT Indore Logo" className={styles.logo} />
          <span className={styles.brandName}>HMS - IIT Indore</span>
        </Link>
      </div>

      {/* Right side: Navigation Links & User Button */}
      <div className={styles.navbarRight}>
        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
          <li>
            <Link href={homeLink}>Home</Link>
          </li>
          {isSignedIn && dbRole === "student" && (
            <li>
              <Link href="/student">Student</Link>
            </li>
          )}
          {isSignedIn && dbRole === "admin" && (
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          )}
          {isSignedIn && dbRole === "guard" && (
            <li>
              <Link href="/guard">Guard</Link>
            </li>
          )}
          {isSignedIn && (
            <li>
              <Link href="/complaints">Complaints</Link>
            </li>
          )}
          {!isSignedIn && (
            <li>
              <Link href="/sign-in">Sign In</Link>
            </li>
          )}
          {isSignedIn && (
            <li className={styles.userButton}>
              <UserButton afterSignOutUrl="/" />
            </li>
          )}
        </ul>

        {/* Hamburger Menu for Mobile */}
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
