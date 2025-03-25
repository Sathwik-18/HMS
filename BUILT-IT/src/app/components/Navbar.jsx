"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaUser, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
import { FiMenu, FiX, FiBell, FiFileText, FiUsers, FiUpload, FiTool, FiHome, FiAlertTriangle, FiInfo } from "react-icons/fi";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [homePath, setHomePath] = useState("/");
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  // Active link styling helper function
  const getLinkClassName = (path) => {
    const isActive = pathname === path;
    return `flex items-center px-4 py-2 relative ${
      isActive 
      ? 'text-indigo-700 border-b-2 border-indigo-900' 
      : 'text-gray-700 hover:text-blue-600'
    } transition duration-200`;
    };

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target) && window.innerWidth < 768) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render links based on role
  const renderLinks = () => {
    if (!session) {
      return (
        <li className="group">
          <Link href="/sign-in" className={getLinkClassName("/sign-in")}>
            <FaUser className="mr-2" /> 
            <span>Sign In</span>
          </Link>
        </li>
      );
    }
    if (role === "admin") {
      return (
        <>
          <li className="group">
            <Link href="/admin" className={getLinkClassName("/admin")}>
              <FaHome className="mr-2" /> 
              <span>Home</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/students-data" className={getLinkClassName("/admin/students-data")}>
              <FiUsers className="mr-2" /> 
              <span>Data</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/spreadsheet-integration" className={getLinkClassName("/admin/spreadsheet-integration")}>
              <FiUpload className="mr-2" /> 
              <span>Upload</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/maintenance-tracking" className={getLinkClassName("/admin/maintenance-tracking")}>
              <FiTool className="mr-2" /> 
              <span>Maintenance</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/room-request-tracking" className={getLinkClassName("/admin/room-request-tracking")}>
              <FiHome className="mr-2" /> 
              <span>Rooms</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/notification-management" className={getLinkClassName("/admin/notification-management")}>
              <FiBell className="mr-2" /> 
              <span>Notifications</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/admin/feedback" className={getLinkClassName("/admin/feedback")}>
              <FiFileText className="mr-2" /> 
              <span>Feedbacks</span>
            </Link>
          </li>
        </>
      );
    } else if (role === "student") {
      return (
        <>
          <li className="group">
            <Link href="/student" className={getLinkClassName("/student")}>
              <FaHome className="mr-2" /> 
              <span>Home</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/student/profile" className={getLinkClassName("/student/profile")}>
              <FaUser className="mr-2" /> 
              <span>Profile</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/student/complaints" className={getLinkClassName("/student/complaints")}>
              <FiFileText className="mr-2" /> 
              <span>Complaints</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/student/room-change-request" className={getLinkClassName("/student/room-change-request")}>
              <FiHome className="mr-2" /> 
              <span>Room Change</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/student/visitor-request" className={getLinkClassName("/student/visitor-request")}>
              <FiUsers className="mr-2" /> 
              <span>Visitor Request</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/student/feedback" className={getLinkClassName("/student/feedback")}>
              <FiFileText className="mr-2" /> 
              <span>Feedback</span>
            </Link>
          </li>
        </>
      );
    } else if (role === "guard") {
      return (
        <>
          <li className="group">
            <Link href="/guard" className={getLinkClassName("/guard")}>
              <FaHome className="mr-2" /> 
              <span>Home</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/guard/check-in-out" className={getLinkClassName("/guard/check-in-out")}>
              <FaClipboardList className="mr-2" /> 
              <span>Check-In/Out</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/guard/visitor-management" className={getLinkClassName("/guard/visitor-management")}>
              <FiUsers className="mr-2" /> 
              <span>Visitors</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/guard/emergency-announcements" className={getLinkClassName("/guard/emergency-announcements")}>
              <FiAlertTriangle className="mr-2" /> 
              <span>Announcements</span>
            </Link>
          </li>
          <li className="group">
            <Link href="/guard/status-info" className={getLinkClassName("/guard/status-info")}>
              <FiInfo className="mr-2" /> 
              <span>Status Info</span>
            </Link>
          </li>
        </>
      );
    } else {
      return (
        <li className="group">
          <Link href="/" className={getLinkClassName("/")}>
            <FaHome className="mr-2" /> 
            <span>Home</span>
          </Link>
        </li>
      );
    }
  };

  const avatarUrl = userData?.user_metadata?.avatar_url;
  const fullName = userData?.user_metadata?.full_name;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={homePath} className="flex items-center">
              <img src="/logo.png" alt="IIT Indore Logo" className="h-10 w-auto mr-3" />
              <span className="text-lg font-semibold text-gray-800 hidden md:block">HMS - IIT Indore</span>
              <span className="text-lg font-semibold text-gray-800 md:hidden">HMS</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <ul className="flex space-x-2">
                {renderLinks()}
              </ul>
            </div>
            
            {/* Profile Button */}
            {session && (
              <div ref={profileRef} className="ml-4 relative">
                <button 
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                      {userData?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                
                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">{fullName || "User"}</p>
                        <p className="text-xs text-gray-600 truncate">{userData?.email}</p>
                        <p className="text-xs text-gray-500 capitalize mt-1">Role: {role || "Unknown"}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setSession(null);
                          router.push("/sign-in");
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out"
                        role="menuitem"
                      >
                        <FaSignOutAlt className="mr-2 text-gray-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex md:hidden ml-4">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-blue-600 transition duration-150 ease-in-out"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {menuOpen && (
        <div ref={menuRef} className="md:hidden bg-white shadow-lg border-t z-40">
          <ul className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderLinks()}
          </ul>
        </div>
      )}
    </nav>
  );
}