import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Hostel Management System - IIT Indore",
  description: "Hostel Management System for IIT Indore",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navbar /> 
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
