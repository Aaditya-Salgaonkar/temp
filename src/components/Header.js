"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hexagon, Search, Bell, Moon, Sun, ChevronDown } from "lucide-react";
import { Logout } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import supabase from "../../supabase";

export default function Header() {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Theme Toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    document.documentElement.classList.toggle("dark");
  };

  // Fetch User Data
  const fetchUserData = useCallback(async () => {
    try {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData?.user) throw new Error("Failed to fetch user.");
      setUser(userData.user);
    } catch (err) {
      console.error(err.message);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Logout Function
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem("token");
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-6">

      <div className="flex items-center space-x-4">
        <Hexagon className="h-12 w-12 text-cyan-500" />
        <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          AgentForge AI
        </span>
      </div>

      

      <div className="flex items-center space-x-6">
        
        <div className="relative">
          <button
           
            className="flex items-center text-white font-semibold"
          >
            Hi, {user?.user_metadata?.fullname || "User"} 
          </button>

         
        </div>

        {user && (
          <Button
            className="hidden md:block bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded-lg"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
