"use client";

import { useEffect, useState, useRef } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import EventExtractor from "@/components/CalenderAI/EventExtractor";
import EmailAgent from "@/components/EmailAI/EmailAgent";
import { Grid, Typography, Box } from "@mui/material";
import { BotMessageSquare, Mail, Calendar, Activity } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import HrRecruitmentAgent from "@/components/HRAI/HrRecruitmentAgent";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);

  lightenColor = (color, percent) => {
    const amount = Math.round((percent / 100) * 255);
    return alpha(color, 0.7);
  };

  const agents = [
    {
      id: "email",
      title: "Email Agent",
      icon: <Mail size={24} />,
      color: "#8b5cf6",
      component: <EmailAgent />,
    },
    {
      id: "calendar",
      title: "Calendar Agent",
      icon: <Calendar size={24} />,
      color: "#0ea5e9",
      component: <EventExtractor />,
    },
    {
      id: "hr",
      title: "hr Agent",
      icon: <BotMessageSquare size={24} />,
      color: "#ec4899",
      component: <HrRecruitmentAgent />,
    },
  ];

  const canvasRef = useRef(null);

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

      <div className="container mx-auto p-4 relative z-10">
        <Header />

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <SideBar />

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="grid gap-6">
              {/* System overview */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden flex items-center justify-between">
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                      Agent Builder
                    </CardTitle>
                  </div>
                </CardHeader>
                  <Link href={'/'}><Button>Create an AI Agent</Button></Link>

                <Grid
                  container
                  spacing={3}
                  sx={{
                    width: "100%",
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {activeAgent ? (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          mb: 3,
                        }}
                      >
                        <Button
                          onClick={() => setActiveAgent(null)}
                          variant="outlined"
                          sx={{
                            border: "2px solid #0ea5e9",
                            color: "#0ea5e9",
                            backgroundColor: "transparent",
                            boxShadow: "0 0 8px rgba(14, 165, 233, 0.5)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "rgba(14, 165, 233, 0.1)",
                              boxShadow: "0 0 15px rgba(14, 165, 233, 0.8)",
                              border: "2px solid #0ea5e9",
                            },
                            "&:active": {
                              transform: "scale(0.98)",
                            },
                            padding: "8px 16px",
                            fontWeight: "medium",
                          }}
                        >
                          BACK
                        </Button>
                      </Box>
                      {agents.find((a) => a.id === activeAgent)?.component}
                    </Grid>
                  ) : (
                    <>
                      {agents.map((agent) => (
                        <Grid
                          item
                          size={{ xs: 12, sm: 6, md: 4 }}
                          key={agent.id}
                          p={2}
                        >
                          <Card
                            onClick={() => setActiveAgent(agent.id)}
                            sx={{
                              p: 2,
                              backgroundColor: "#0f172a",
                              borderRadius: "12px",
                              border: `2px solid ${agent.color}`,
                              boxShadow: `0 0 10px ${agent.color}`,
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                              minHeight: "200px",
                              "&:hover": {
                                transform: "translateY(-5px)",
                                boxShadow: `0 0 20px ${agent.color}`,
                                "&::before": {
                                  opacity: 0.3,
                                },
                              },
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at center, ${agent.color} 0%, transparent 70%)`,
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                                zIndex: 0,
                              },
                            }}
                          >
                            <Box sx={{ color: agent.color, mb: 2, zIndex: 1 }}>
                              {agent.icon}
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                background: `linear-gradient(to right, ${
                                  agent.color
                                }, ${lightenColor(agent.color, 20)})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                mb: 1,
                                zIndex: 1,
                              }}
                            >
                              {agent.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#94a3b8", zIndex: 1 }}
                            >
                              Click to activate {agent.title.toLowerCase()}
                            </Typography>
                          </Card>
                          
                        </Grid>
                      ))}
                    </>
                  )}
                </Grid>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
