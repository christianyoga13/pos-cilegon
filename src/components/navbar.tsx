"use client";

import { Bell, Mail, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-900 p-4 flex justify-between items-center w-full sticky top-0 z-20">
      <div className="flex items-center">
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-gray-700 text-white p-2 rounded" 
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <Mail className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
        <Bell className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Image 
              src="https://media.licdn.com/dms/image/v2/D5635AQH6J8EuZs0XZA/profile-framedphoto-shrink_100_100/profile-framedphoto-shrink_100_100/0/1708619030313?e=1740214800&v=beta&t=bD8lo4WpUcminBS5gGW79Gyp6VwYgdTws0xpu3Xm_w4" 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
              width={40}
              height={40}
            />
            <ChevronDown className="text-white w-4 h-4" />
          </div>

          {isDropdownOpen && user && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}