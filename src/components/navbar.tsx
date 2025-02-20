"use client";

import { Bell, Mail, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.uid) {
      const fetchProfileImage = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfileImage(userSnap.data().profileImageUrl || null);
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      };

      fetchProfileImage();
    }
  }, [user]);

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
        <SidebarTrigger className="bg-white" />
      </div>

      <div className="flex items-center space-x-6">
        <Mail className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
        <Bell className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />

        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
                width={40}
                height={40}
              />
            ) : (
              <Image
                src="/placeholder-profile.jpg"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
                width={40}
                height={40}
              />
            )}
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
