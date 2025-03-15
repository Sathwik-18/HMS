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
            <img src={image} alt={`Admin View ${index + 1}`} className={styles.sliderImage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
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
  },);

  if (!session) return <div className={styles.loadingError}>Please sign in to access the Admin Dashboard.</div>;

  const adminDashboardCards = [
    { title: "Student's Data", image: "/images/students.png", link: "/admin/students-data" },
    { title: "Room Change Requests", image: "/images/room-change.png", link: "/admin/room-request-tracking" },
    { title: "Spreadsheet Integration", image: "/images/spreadsheet.png", link: "/admin/spreadsheet-integration" },
    { title: "Maintenance Tracking", image: "/images/maintenance.png", link: "/admin/maintenance-tracking" },
    { title: "Analytics & Reporting", image: "/images/analytics.png", link: "/admin/analytics-dashboard" },
    { title: "Notification Management", image: "/images/notification.png", link: "/admin/notification-management" },
    { title: "Feedbacks", image: "/images/feedback.png", link: "/admin/feedback" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.imageSliderWrapper}>
        <ImageSlider />
      </div>
      <h1 className={styles.dashboardHeading}>Admin Dashboard</h1>
      <div className={styles.cardGrid}>
        {adminDashboardCards.map((card, index) => (
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