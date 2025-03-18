"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import styles from "./page.module.css";

export default function StudentProfile() {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Get session using Supabase auth
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch student record based on roll number (derived from email)
  useEffect(() => {
    async function fetchStudent() {
      if (session && session.user) {
        const email = session.user.email;
        const rollNo = email.split("@")[0];
        try {
          const res = await fetch(`/api/student?rollNo=${rollNo}`);
          const data = await res.json();
          if (data.error) {
            setError(data.error);
          } else {
            setStudent(data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStudent();
  }, [session]);

  if (!session) {
    return <div className={styles.loading}>Please sign in to view your profile.</div>;
  }
  if (loading) {
    return <div className={styles.loading}>Loading your student record...</div>;
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorHeading}>Error:</h1>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }
  if (!student) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorHeading}>No student record found for your account.</h1>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.mainHeading}>Student Profile</h1>
      <div className={styles.profileContainer}>
        <section className={styles.profileSection}>
          <h2 className={styles.sectionHeading}>Personal Details</h2>
          <p className={styles.text}><strong>Roll No:</strong> {student.roll_no}</p>
          <p className={styles.text}><strong>Full Name:</strong> {student.full_name}</p>
          <p className={styles.text}><strong>Email:</strong> {student.email}</p>
          <p className={styles.text}><strong>Department:</strong> {student.department}</p>
          <p className={styles.text}><strong>Batch:</strong> {student.batch}</p>
        </section>
        <section className={styles.roomSection}>
          <h2 className={styles.sectionHeading}>Room Details</h2>
          <p className={styles.text}>
            <strong>Room Number:</strong> {student.room_number ? student.room_number : "Not Assigned"}
          </p>
          <p className={styles.text}>
            <strong>Hostel Block:</strong> {student.hostel_block ? student.hostel_block : "Not Assigned"}
          </p>
        </section>
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionHeading}>Actions</h2>
          <p className={styles.actionLink}>
            <Link href="/student/complaints" className={styles.link}>File/View Complaints</Link>
          </p>
          <p className={styles.actionLink}>
            <Link href="/student/room-change-request" className={styles.link}>Request a Room Change</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
