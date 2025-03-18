"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import styles from "../student/page.module.css"; // Using the same styles

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
            <img src={image} alt={`Guard View ${index + 1}`} className={styles.sliderImage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuardDashboard() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!session) return <div className={styles.loadingError}>Please sign in to access the Guard Dashboard.</div>;

  const guardDashboardCards = [
    { title: "Check In/Check Out", image: "/images/check-inout.png", link: "/guard/check-in-out" },
    { title: "Visitor Management", image: "/images/visitor.png", link: "/guard/visitor-management" },
    { title: "Emergency Announcements", image: "/images/emergency.png", link: "/guard/emergency-announcements" },
    { title: "Query Visitor Requests", image: "/images/query.png", link: "/guard/query-visitors" },
    { title: "Status Info", image: "/images/students.png", link: "/guard/status-info" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.imageSliderWrapper}>
        <ImageSlider />
      </div>
      <h1 className={styles.dashboardHeading}>Guard Dashboard</h1>
      <div className={styles.cardGrid}>
        {guardDashboardCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <Link href={card.link} className={styles.cardLink}>
              <img src={card.image} alt={card.title} className={styles.cardImage} />
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}