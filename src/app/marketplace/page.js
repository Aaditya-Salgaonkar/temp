"use client";

import { useEffect, useState,useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Activity, Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import supabase from "../../../supabase";

import { ShoppingCart, Users, BadgeCheck } from "lucide-react";
import Tile from "@/components/Tile"; // Import Tile component

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
    const canvasRef = useRef(null);
  const [theme, setTheme] = useState("dark");


const handleProductRemove = async (id) => {
  const { error } = await supabase.from("marketplace").delete().eq("id", id);

  if (error) {
    console.error("Error removing item:", error);
    return;
  }

  // Refresh marketplace data after deletion
  fetchData();
};

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
  
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        setIsLoading(false);
        return;
      }
      
      const userId = user?.user?.id; // Get the current logged-in user ID
  
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("*");
  
      const { data: marketplace, error: marketplaceError } = await supabase
        .from("marketplace")
        .select("*");
  
      if (agentsError) console.error("Error fetching agents:", agentsError);
      if (marketplaceError) console.error("Error fetching marketplace:", marketplaceError);
  
      const mergedData = marketplace.map((item) => {
        const agent = agents.find((a) => a.id === item.agent_id);
        return {
          ...item,
          agent_name: agent ? agent.name : "Unknown Agent",
          agent_type: agent ? agent.agent_type : "N/A",
          finetuning_data: agent ? agent.finetuning_data : "N/A",
          isOwner: agent ? agent.user_id === userId : false, // Check if user is owner
        };
      });
  
      setData(mergedData);
      setIsLoading(false);
    }
  
    fetchData();
  }, []);
  
  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${
          Math.floor(Math.random() * 100) + 150
        }, ${Math.floor(Math.random() * 55) + 200}, ${
          Math.random() * 0.5 + 0.2
        })`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }
  return (
     <div
              className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden pb-40`}
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full opacity-30"
              />
        
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
                      <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
                      <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
              )}
        
        <div className=" min-h-screen  text-slate-100 relative">
      


      <div className="container mx-auto p-4 relative z-10">
        <Header />
        
        <div className="grid grid-cols-12 gap-6">
          <SideBar />

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-lg overflow-hidden shadow-lg">
              <CardHeader className="border-b border-slate-700/50 pb-3">
                <CardTitle className="text-slate-100 flex items-center text-3xl">
                  <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                  Marketplace Items
                </CardTitle>
              </CardHeader>

              {/* Display Items */}
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {data.length > 0 ? (
    data.map((item) => (
      <Tile
        key={item.id}
        name={item.category || "Unnamed Product"}
        developer={item.agent_name}
        price={item.price}
        description={`Agent Type: ${item.agent_type} `}
        isOwner={item.isOwner} // Pass ownership flag
        onRemove={() => handleProductRemove(item.id)}
      />
    ))
  ) : (
    <p className="text-center text-gray-400 col-span-3">
      No marketplace items found.
    </p>
  )}
</CardContent>


            </Card>
          </div>
        </div>
      </div>
    </div>
            </div>
    
  );
}
