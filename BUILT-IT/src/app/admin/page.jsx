"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UserIcon, 
  LayoutDashboardIcon, 
  FileSpreadsheetIcon, 
  WrenchIcon, 
  BarChart3Icon, 
  BellIcon, 
  MessageSquareTextIcon,
  LogOutIcon
} from "lucide-react";

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalImages]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalImages - 1 : prevIndex - 1));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const adminDashboardCards = [
    { 
      title: "Student's Data", 
      image: "/images/students.png", 
      link: "/admin/students-data",
      icon: <UserIcon className="w-6 h-6" />,
      description: "View and manage student records and information" 
    },
    { 
      title: "Room Change Requests", 
      image: "/images/room-change.png", 
      link: "/admin/room-request-tracking",
      icon: <LayoutDashboardIcon className="w-6 h-6" />,
      description: "Process and track student room change requests" 
    },
    { 
      title: "Spreadsheet Integration", 
      image: "/images/spreadsheet.png", 
      link: "/admin/spreadsheet-integration",
      icon: <FileSpreadsheetIcon className="w-6 h-6" />,
      description: "Import and export data with spreadsheet tools" 
    },
    { 
      title: "Maintenance Tracking", 
      image: "/images/maintenance.png", 
      link: "/admin/maintenance-tracking",
      icon: <WrenchIcon className="w-6 h-6" />,
      description: "Monitor campus maintenance requests and status" 
    },
    { 
      title: "Analytics & Reporting", 
      image: "/images/analytics.png", 
      link: "/admin/analytics-dashboard",
      icon: <BarChart3Icon className="w-6 h-6" />,
      description: "View statistics and generate reports" 
    },
    { 
      title: "Notification Management", 
      image: "/images/notification.png", 
      link: "/admin/notification-management",
      icon: <BellIcon className="w-6 h-6" />,
      description: "Manage system notifications and alerts" 
    },
    { 
      title: "Feedbacks", 
      image: "/images/feedback.png", 
      link: "/admin/feedback",
      icon: <MessageSquareTextIcon className="w-6 h-6" />,
      description: "Review and respond to user feedback" 
    },
  ];

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to access the Admin Dashboard.</p>
          <button 
            onClick={() => router.push("/sign-in")}
            className="mt-6 w-full bg-indigo-900 text-white py-2 px-4 rounded-md hover:bg-indigo-800 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center bg-indigo-800 hover:bg-indigo-700 py-2 px-4 rounded-md transition"
          >
            <LogOutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Image Slider */}
      <div className="relative overflow-hidden h-64 md:h-80">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full" 
          style={{ transform: `translateX(-${currentIndex * 100 / totalImages}%)`, width: `${totalImages * 100}%` }}
        >
          {images.map((image, index) => (
            <div key={index} style={{ width: `${100 / totalImages}%` }} className="relative">
              <img 
                src={image} 
                alt={`Campus View ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
          ))}
        </div>
        
        {/* Slider Controls */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
        >
          <ChevronLeftIcon className="w-6 h-6 text-indigo-900" />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
        >
          <ChevronRightIcon className="w-6 h-6 text-indigo-900" />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Admin Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminDashboardCards.map((card, index) => (
            <Link 
              href={card.link} 
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
            >
              <div className="bg-indigo-900 p-6 flex justify-center items-center group-hover:bg-indigo-800 transition">
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}