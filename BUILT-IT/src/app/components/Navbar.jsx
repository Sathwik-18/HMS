"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine user role from Clerk publicMetadata if available
  const userRole = user?.publicMetadata?.role;

  // Set home link based on role: if student then /student, admin => /admin, guard => /guard; otherwise "/"
  const homeLink = isSignedIn
    ? userRole === "student"
      ? "/student"
      : userRole === "admin"
      ? "/admin"
      : userRole === "guard"
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
          {isSignedIn && userRole === "student" && (
            <li>
              <Link href="/student">Student</Link>
            </li>
          )}
          {isSignedIn && userRole === "admin" && (
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          )}
          {isSignedIn && userRole === "guard" && (
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
