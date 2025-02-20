import { UserCog, Store, Volleyball, CookingPot } from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Booking Venue",
    url: "/",
    icon: Volleyball,
  },
  {
    title: "Restaurant",
    url: "/Food",
    icon: CookingPot,
  },
  {
    title: "Minimarket",
    url: "/minimarket",
    icon: Store,
  },
  {
    title: "Admin",
    url: "/Admin",
    icon: UserCog,
  },
]

export function AppSidebar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Cilegon Park</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                (item.title !== "Admin" || userEmail === "admin@gmail.com") && (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
