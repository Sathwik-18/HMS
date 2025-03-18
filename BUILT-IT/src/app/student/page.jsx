"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const images = [
    '/images/apj.jpg',
    '/images/cvr.jpg',
    '/images/da.jpg',
    '/images/hjb.jpg',
    '/images/vsb.jpg',
  ];
  const totalImages = images.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }, 3000);
    return () => clearInterval(timer);
  }, [totalImages]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'margin-left 0.5s ease-in-out';
      sliderRef.current.style.marginLeft = `-${currentIndex * 100}%`;
    }
  }, [currentIndex]);

  return (
    <div className={styles.imageSliderContainer}>
      <div className={styles.imageSlider} ref={sliderRef} style={{ width: `${totalImages * 100}%` }}>
        {images.map((image, index) => (
          <div key={index} className={styles.slide} style={{ width: `${100 / totalImages}%` }}>
            <img src={image} alt={`Hostel View ${index + 1}`} className={styles.sliderImage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        setUserData(session.user);
      }
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserData(session ? session.user : null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchStudent() {
      if (session && userData) {
        const email = userData.email;
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
  }, [session, userData]);

  if (!session) return <div className={styles.loadingError}>Please sign in to view your dashboard.</div>;
  if (loadingStudent) return <div className={styles.loadingError}>Loading your student record...</div>;
  if (error)
    return (
      <div className={styles.page}>
        <h1 className={styles.errorHeading}>Error:</h1>
        <p className={styles.errorText}>{error}</p>
        <p className={styles.errorText}>
          Your Roll No: {userData ? userData.email.split("@")[0] : "N/A"}
        </p>
      </div>
    );
  if (!student)
    return (
      <div className={styles.page}>
        <h1 className={styles.errorHeading}>No student record found for your account.</h1>
        <p className={styles.errorText}>
          Your Roll No: {userData ? userData.email.split("@")[0] : "N/A"}
        </p>
      </div>
    );

  const dashboardCards = [
    { title: 'Profile', image: '/images/profile.png', link: '/student/profile' },
    { title: 'Complaints', image: '/images/complaints.png', link: '/student/complaints' },
    { title: 'Room Change Requests', image: '/images/room-change.png', link: '/student/room-change-request' },
    { title: 'Feedback', image: '/images/feedback.png', link: '/student/feedback' },
    { title: 'Academic Portal', image: '/images/academic.png', link: 'https://academic.iiti.ac.in/app/login', isExternal: true },
    { title: 'Dining Portal', image: '/images/dining.png', link: 'https://diningfee.iiti.ac.in', isExternal: true },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.imageSliderWrapper}>
        <ImageSlider />
      </div>
      <h1 className={styles.dashboardHeading}>Student Dashboard</h1>
      <div className={styles.cardGrid}>
        {dashboardCards.map((card, index) => (
          <div key={index} className={styles.card}>
            {card.isExternal ? (
              <a href={card.link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                <img src={card.image} alt={card.title} className={styles.cardImage} />
                <h3 className={styles.cardTitle}>{card.title}</h3>
              </a>
            ) : (
              <Link href={card.link} className={styles.cardLink}>
                <img src={card.image} alt={card.title} className={styles.cardImage} />
                <h3 className={styles.cardTitle}>{card.title}</h3>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
