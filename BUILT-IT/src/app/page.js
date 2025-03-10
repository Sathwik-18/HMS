import Navbar from './components/Navbar';

export default function HomePage() {
  return (
    <div>
      <main className="container mx-auto px-6 py-20 text-center"> {/* Main content container */}
        <h1 className="text-4xl font-bold text-blue-700 mb-4"> {/* Large heading, blue color */}
          Welcome to IIT Indore Hostel Management System
        </h1>
        <p className="text-gray-600 text-lg"> {/* Sub-heading, slightly smaller, gray color */}
          Manage all hostel-related activities seamlessly.
        </p>
        {/* You can add more content here later, like brief feature highlights, etc. */}
      </main>
    </div>
  );
}