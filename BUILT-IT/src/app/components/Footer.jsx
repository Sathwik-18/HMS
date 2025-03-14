// Footer.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h3>Academic Links</h3>
          <ul>
            <li><Link href="https://academic.iiti.ac.in/">Academics</Link></li>
            <li><Link href="/assets/academic-calendar.pdf">Academic Calendar</Link></li>
            <li><Link href="/assets/holidays.pdf">Holidays</Link></li>
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
            <li><Link href="https://www.iiti.ac.in/">IIT Indore Home</Link></li>
          </ul>
          
          <div className={styles.instituteLogo}>
            <Image 
              src="/logo.png" 
              alt="IIT Indore Logo" 
              width={120} 
              height={120}
            />
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className={styles.addressInfo}>
          <p>Indian Institute of Technology Indore</p>
          <p>Khandwa Road, Simrol, Indore, India - 453552</p>
        </div>
        
        <div className={styles.copyright}>
          <p>© {currentYear} Indian Institute of Technology Indore</p>
          <div className={styles.bottomLinks}>
            <Link href="/legal-disclaimer">Legal Disclaimer</Link>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
      
      <div className={styles.scrollToTop}>
        <a href="#top" aria-label="Scroll to top">↑</a>
      </div>
    </footer>
  );
};

export default Footer;