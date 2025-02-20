"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/context/AuthContext";
import { ProfileImageProvider } from "@/context/ProfileImageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProfileImageProvider>
          {isLoginPage ? (
            <main className="antialiased w-full flex flex-col">
              {children}
            </main>
          ) : (
            <SidebarProvider>
              <AppSidebar />
              <main className={`${geistSans.variable} ${geistMono.variable} antialiased w-full flex flex-col`}>
                <Navbar />
                {children}
              </main>
            </SidebarProvider>
          )}
          </ProfileImageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;