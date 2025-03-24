"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UserIcon, 
  FileTextIcon, 
  HomeIcon, 
  MessageSquareTextIcon,
  BookOpenIcon,
  UtensilsIcon,
  LogOutIcon
} from "lucide-react";

export default function StudentDashboard() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  
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

  const dashboardCards = [
    { 
      title: 'Profile', 
      image: '/images/profile.png', 
      link: '/student/profile',
      icon: <UserIcon className="w-6 h-6" />,
      description: "View and update your personal information"
    },
    { 
      title: 'Complaints', 
      image: '/images/complaints.png', 
      link: '/student/complaints',
      icon: <FileTextIcon className="w-6 h-6" />,
      description: "Submit and track your complaints"
    },
    { 
      title: 'Room Change Requests', 
      image: '/images/room-change.png', 
      link: '/student/room-change-request',
      icon: <HomeIcon className="w-6 h-6" />,
      description: "Request and track room changes"
    },
    { 
      title: 'Feedback', 
      image: '/images/feedback.png', 
      link: '/student/feedback',
      icon: <MessageSquareTextIcon className="w-6 h-6" />,
      description: "Share your feedback and suggestions"
    },
    { 
      title: 'Academic Portal', 
      image: '/images/academic.png', 
      link: 'https://academic.iiti.ac.in/app/login', 
      isExternal: true,
      icon: <BookOpenIcon className="w-6 h-6" />,
      description: "Access your courses and academic records"
    },
    { 
      title: 'Dining Portal', 
      image: '/images/dining.png', 
      link: 'https://diningfee.iiti.ac.in', 
      isExternal: true,
      icon: <UtensilsIcon className="w-6 h-6" />,
      description: "Manage dining preferences and meal plans"
    },
  ];

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please sign in to access your Student Dashboard.</p>
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

  if (loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading</h2>
          <p className="mt-2 text-gray-600">Fetching your student record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Your Roll No: {userData ? userData.email.split("@")[0] : "N/A"}
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800">No Record Found</h2>
          <p className="mt-2 text-gray-600">No student record found for your account.</p>
          <p className="mt-4 text-sm text-gray-500">
            Your Roll No: {userData ? userData.email.split("@")[0] : "N/A"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            {student && (
              <p className="text-indigo-200 mt-1">
                Welcome, {student.full_name} 
              </p>
            )}
          </div>
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
      
      
      {student && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center md:text-left">
                {/* <p className="text-sm text-gray-500">Name</p> */}
                {/* <p className="font-semibold text-gray-800">{student.name}</p> */}
              </div>
              <div className="text-center">
                {/* <p className="text-sm text-gray-500">Room</p> */}
                {/* <p className="font-semibold text-gray-800">{student.room || "Not Assigned"}</p> */}
              </div>
              <div className="text-center md:text-right">
                {/* <p className="text-sm text-gray-500">Hostel</p> */}
                {/* <p className="font-semibold text-gray-800">{student.hostel || "Not Assigned"}</p> */}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            card.isExternal ? (
              <a 
                href={card.link} 
                target="_blank" 
                rel="noopener noreferrer"
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                <div className="bg-indigo-900 p-6 flex justify-center items-center group-hover:bg-indigo-800 transition">
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </a>
            ) : (
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
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}