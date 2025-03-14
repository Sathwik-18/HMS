import Navbar from './components/Navbar';

export default function HomePage() {
  return (
    <div>
      <main className="container mx-auto px-6 py-20 text-center"> 
        <h1 className="text-4xl font-bold text-blue-700 mb-4"> 
          Welcome to IIT Indore Hostel Management System
        </h1>
        <p className="text-gray-600 text-lg"> 
          Manage all hostel-related activities seamlessly.
        </p>
      </main>
    </div>
  );
}