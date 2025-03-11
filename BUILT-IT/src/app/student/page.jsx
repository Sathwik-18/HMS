"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      if (isLoaded && isSignedIn && user) {
        const email = user.primaryEmailAddress.emailAddress;
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
          setLoadingStudent(false);
        }
      }
    }
    fetchStudent();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) return <div style={loadingErrorStyle}>Loading Clerk user info...</div>;
  if (!isSignedIn) return <div style={loadingErrorStyle}>Please sign in to view your dashboard.</div>;
  if (loadingStudent) return <div style={loadingErrorStyle}>Loading your student record...</div>;
  if (error)
    return (
      <div style={{ ...pageStyle, ...errorContainerStyle }}>
        <h1 style={errorHeadingStyle}>Error:</h1>
        <p style={errorTextStyle}>{error}</p>
        <p style={errorTextStyle}>
          Your Roll No (derived from email):{" "}
          {user?.primaryEmailAddress.emailAddress.split("@")[0]}
        </p>
      </div>
    );
  if (!student)
    return (
      <div style={{ ...pageStyle, ...errorContainerStyle }}>
        <h1 style={errorHeadingStyle}>No student record found for your account.</h1>
        <p style={errorTextStyle}>
          Your Roll No (derived from email):{" "}
          {user?.primaryEmailAddress.emailAddress.split("@")[0]}
        </p>
      </div>
    );

  return (
    <div style={pageStyle}>
      <h1 style={mainHeadingStyle}>Student Dashboard</h1>
      <div style={sectionsGrid}>
        <section style={{ ...sectionStyle, ...profileSection }}>
          <h2 style={sectionHeadingStyle}>Profile</h2>
          <p style={textStyle}><strong>Roll No:</strong> {student.roll_no}</p>
          <p style={textStyle}><strong>Full Name:</strong> {student.full_name}</p>
          <p style={textStyle}><strong>Department:</strong> {student.department}</p>
          <p style={textStyle}><strong>Batch:</strong> {student.batch}</p>
        </section>
        <section style={{ ...sectionStyle, ...feeStatusSection }}>
          <h2 style={sectionHeadingStyle}>Fee Status</h2>
          <p style={textStyle}>{student.fees_paid ? "Paid" : "Due"}</p>
        </section>
        <section style={{ ...sectionStyle, ...roomDetailsSection }}>
          <h2 style={sectionHeadingStyle}>Room Details</h2>
          <p style={textStyle}>
            <strong>Room Number:</strong>{" "}
            {student.room_number ? student.room_number : "Not Assigned"}
          </p>
          <p style={textStyle}>
            <strong>Hostel Block:</strong>{" "}
            {student.hostel_block ? student.hostel_block : "Not Assigned"}
          </p>
        </section>
        <section style={{ ...sectionStyle, ...actionsSection }}>
          <h2 style={sectionHeadingStyle}>Actions</h2>
          <p style={actionLinkStyle}>
            <Link href="/complaints" style={linkStyle}>File/View Complaints</Link>
          </p>
          <p style={actionLinkStyle}>
            <Link href="/room-change-request" style={linkStyle}>Request a Room Change</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

const pageStyle = {
  fontFamily: 'poppins, sans-serif',
  backgroundColor: '#f4f4f7',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '4rem'
};

const mainHeadingStyle = {
  margin: '0 0 1.5rem 0',
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center'
};

const sectionsGrid = {
  display: 'grid',
  gridTemplateColumns: '70% 30%',
  gap: '1.5rem',
  maxWidth: '1200px',
  width: '100%'
};

const sectionStyle = {
  padding: '1rem',
  border: '1px solid #e0e0e0',
  borderRadius: '1rem',
  boxShadow: '0 0.25rem 0.5rem rgba(0,0,0,0.15)',
  backgroundColor: 'white'
};

const profileSection = {
  gridColumn: '1 / 2',
  gridRow: '1 / 3',
};

const feeStatusSection = {
  gridColumn: '2 / 3',
  gridRow: '1',
  alignSelf: 'start'
};

const roomDetailsSection = {
  gridColumn: '1 / 2',
  gridRow: '2',
  marginTop: '1rem'
};

const actionsSection = {
  gridColumn: '1 / 3',
  gridRow: '3',
};

const sectionHeadingStyle = {
  fontSize: '1.5rem',
  fontWeight: 'semibold',
  marginBottom: '1rem',
  color: '#555'
};

const textStyle = {
  marginBottom: '0.5rem',
  color: '#333'
};

const actionLinkStyle = {
  marginBottom: '0.5rem',
};

const linkStyle = {
  color: '#007bff',
  textDecoration: 'none',
  fontWeight: 'medium',
  transition: 'color 0.2s ease-in-out',
};

const loadingErrorStyle = {
  padding: "2rem",
  textAlign: 'center',
  fontSize: '1rem',
  color: '#777'
};

const errorContainerStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '0.5rem',
  boxShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.1)',
  maxWidth: '800px',
  width: '100%',
  textAlign: 'center'
};

const errorHeadingStyle = {
  color: 'red',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem'
};

const errorTextStyle = {
  color: 'red',
  marginBottom: '0.5rem'
};
