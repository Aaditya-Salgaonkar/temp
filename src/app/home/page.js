"use client";

import { useEffect, useState,useRef } from "react";
import { Cpu, IndianRupee, Users } from "lucide-react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "../../../supabase";

export default function Dashboard() {
    const canvasRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [aiAgents, setAiAgents] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [subscribers, setSubscribers] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not authenticated", userError);
          return;
        }

        const userId = user.id;

        const { count: agentCount, error: agentsError } = await supabase
          .from("agents")
          .select("*", { count: "exact" })
          .eq("user_id", userId);

        if (agentsError) throw agentsError;

        setAiAgents(agentCount || 0);

        const { data: userAgents, error: userAgentsError } = await supabase
          .from("marketplace")
          .select("agent_id")
          .eq("user_id", userId);

        if (userAgentsError) throw userAgentsError;

        const agentIds = userAgents.map((agent) => agent.agent_id);

        if (agentIds.length === 0) {
          setRevenue(0);
          setSubscribers(0);
          return;
        }

        const { data: revenueData, error: revenueError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("payment_status", "completed")
          .in("agent_id", agentIds);

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        setRevenue(Math.round(totalRevenue)); // Ensures revenue is displayed as an integer

        const { data: buyersData, error: buyersError } = await supabase
          .from("transactions")
          .select("user_id")
          .eq("payment_status", "completed")
          .in("agent_id", agentIds);

        if (buyersError) throw buyersError;

        const uniqueBuyers = new Set(buyersData.map((buyer) => buyer.user_id));
        setSubscribers(uniqueBuyers.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

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
    
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-5">
      <Header />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          <SideBar />
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Cpu className="text-blue-500 mr-2" />
                      AI Agents
                    </CardTitle>
                    <span className="text-lg font-bold">{aiAgents}</span>
                  </CardHeader>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <IndianRupee className="text-green-500 mr-2" />
                      Revenue
                    </CardTitle>
                    <span className="text-lg font-bold">₹{revenue}</span>
                  </CardHeader>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Users className="text-yellow-500 mr-2" />
                      Subscribers
                    </CardTitle>
                    <span className="text-lg font-bold">{subscribers}</span>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        </div>
    
  );
}
