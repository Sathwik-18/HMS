// Footer.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { FaYoutube, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa6';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FaYoutube />, url: 'www.youtube.com/channel/UCRnqhv7p9bU1B2eHO7IFfPw/videos', alt: 'YouTube' },
    { icon: <FaFacebook />, url: 'https://www.facebook.com/profile.php?id=100064798209779', alt: 'Facebook' },
    { icon: <FaTwitter />, url: 'https://x.com/iitiofficial?lang=en', alt: 'X' },
    { icon: <FaInstagram />, url: 'https://www.instagram.com/iitindoreofficial/', alt: 'Instagram' },
    { icon: <FaLinkedin />, url: 'https://www.linkedin.com/school/iit-indore/', alt: 'LinkedIn' },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.instituteBranding}>
          <div className={styles.instituteLogo}>
            <Image
              src="/logo.png"
              alt="IIT Indore Logo"
              width={100}
              height={100}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div className={styles.instituteInfo}>
            <h2>Indian Institute of Technology Indore</h2>
            <p>Khandwa Road, Simrol, Indore, India - 453552</p>
          </div>
        </div>
      </div>

      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h3>Academic Links</h3>
          <ul>
            <li><Link href="https://academic.iiti.ac.in/">Academics</Link></li>
            <li><Link href="/academic_calendar.pdf">Academic Calendar</Link></li>
            <li><Link href="/holidays.pdf">Holidays</Link></li>
            <li><Link href="https://www.iiti.ac.in/page/e-payments">E-Payments</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3>Campus Facilities</h3>
          <ul>
            <li><Link href="https://healthcenter.iiti.ac.in/">Health Centre</Link></li>
            <li><Link href="http://iiti.ac.in/page/counselling-cell">Counselling Services</Link></li>
            <li><Link href="https://diningfee.iiti.ac.in/">Central Dining Facility</Link></li>
            <li><Link href="http://iiti.ac.in/page/campus-facilities">Campus Facilities</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3>Services</h3>
          <ul>
            <li><Link href="http://vbs.iiti.ac.in/">Transport Booking</Link></li>
            <li><Link href="https://www.iiti.ac.in/public/storage/Green%20vehicle%20schedule-%202022-23.pdf">Green Vehicle Schedule</Link></li>
            <li><Link href="http://safety.iiti.ac.in/">Campus Safety</Link></li>
            <li><Link href="http://icc.iiti.ac.in/">Internal Complaints Committee</Link></li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3>Infrastructure</h3>
          <ul>
            <li><Link href="https://ido.iiti.ac.in/">Infrastructure Development Office</Link></li>
            <li><Link href="https://academic.iiti.ac.in/New_student/ROUTE%20MAP.pdf">How to Reach Us</Link></li>
            <li><Link href="https://www.iiti.ac.in/">IIT Indore Home</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.socialSection}>
        <h3>Connect With Us</h3>
        <div className={styles.socialLinks}>
          {socialLinks.map((social, index) => (
            <Link key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              {social.icon}
              <span className={styles.srOnly}>{social.alt}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          <p>© {currentYear} Indian Institute of Technology Indore</p>
        </div>
        <div className={styles.bottomLinks}>
          <Link href="/legal-disclaimer">Legal Disclaimer</Link>
          <span className={styles.divider}>|</span>
          <Link href="https://ido.iiti.ac.in/campus.php">Sitemap</Link>
        </div>
      </div>

      <div className={styles.scrollToTop}>
        <a href="#top" aria-label="Scroll to top">
          <span className={styles.scrollIcon}>↑</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;