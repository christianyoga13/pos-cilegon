import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface ProfileImageContextProps {
  profileImage: string | null;
  setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProfileImageContext = createContext<ProfileImageContextProps | undefined>(undefined);

export const ProfileImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

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

  return (
    <ProfileImageContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
};

export const useProfileImage = () => {
  const context = useContext(ProfileImageContext);
  if (context === undefined) {
    throw new Error("useProfileImage must be used within a ProfileImageProvider");
  }
  return context;
};