"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import EventExtractor from "@/components/CalenderAI/EventExtractor";
import EmailAgent from "@/components/EmailAI/EmailAgent";
import {
  Grid,
  Typography,
  Box,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  BotMessageSquare,
  Mail,
  Calendar,
  Activity,
  Plus,
  FileText,
  ArrowLeft,
} from "lucide-react";
import HrRecruitmentAgent from "@/components/HRAI/HrRecruitmentAgent";
import { alpha } from "@mui/material/styles";
import EmailSummaryAgent from "@/components/EmailSumAI/EmailSummary";
import getUserID from "@/components/getUserID";
import supabase from "../../../supabase";
import AgentBuilderForm from "@/components/AgenBuilderForm";

async function fetchUserData() {
  const userId = await getUserID();
  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user name:", error.message);
    return "";
  }
  return data?.name || "";
}

async function fetchUserAgents() {
  const userId = await getUserID();
  const { data, error } = await supabase
    .from("agents")
    .select("id, agent_type")
    .eq("user_id", userId);
  if (error) {
    console.error("Error fetching agents:", error.message);
    return [];
  }
  return data || [];
}

const agentComponents = {
  email: {
    title: "Email Agent",
    icon: <Mail size={24} />,
    color: "#8b5cf6",
    component: <EmailAgent />,
  },
  calender: {
    title: "Calendar Agent",
    icon: <Calendar size={24} />,
    color: "#0ea5e9",
    component: <EventExtractor />,
  },
  hr: {
    title: "HR Agent",
    icon: <BotMessageSquare size={24} />,
    color: "#ec4899",
    component: <HrRecruitmentAgent />,
  },
  emailSummary: {
    title: "Email Summary Agent",
    icon: <FileText size={24} />,
    color: "#10b981",
    component: <EmailSummaryAgent />,
  },
  // Add a default fallback
  default: {
    title: "Custom Agent",
    icon: <BotMessageSquare size={24} />,
    color: "#64748b", // A neutral color
    component: <div>Custom Agent</div>,
  },
};

export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [userName, setUserName] = useState("Loading...");
  const [agents, setAgents] = useState([]);
  const [openAgentBuilder, setOpenAgentBuilder] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function initializeDashboard() {
      const name = await fetchUserData();
      setUserName(name);

      const userAgents = await fetchUserAgents();
      const mappedAgents = userAgents.map(({ id, agent_type }) => {
        const agentInfo =
          agentComponents[agent_type] || agentComponents.default;
        return {
          id: id,
          agent_type: agent_type,
          ...agentInfo,
          component: agentInfo.component
            ? React.cloneElement(agentInfo.component, {
                AGENT_ID: id,
                userName: userName,
              })
            : null,
        };
      });

      setAgents(mappedAgents);
    }
    initializeDashboard();
  }, []);

  const handleToggleAgentBuilder = () => {
    setOpenAgentBuilder(!openAgentBuilder);
  };

  const handleAgentCreated = async () => {
    handleToggleAgentBuilder();
    const userAgents = await fetchUserAgents();
    const mappedAgents = userAgents.map(({ id, agent_type }) => {
      const agentInfo = agentComponents[agent_type] || agentComponents.default;
      return {
        id: id,
        agent_type: agent_type,
        ...agentInfo,
        component: agentInfo.component
          ? React.cloneElement(agentInfo.component, {
              AGENT_ID: id,
              userName: userName,
            })
          : null,
      };
    });
    setAgents(mappedAgents);
  };

  const lightenColor = (color, percent) => {
    if (!color) return "#64748b"; // Return a default color if undefined

    // Handle cases where color might not be a hex value
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexPattern.test(color)) return "#64748b";

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
  };

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
                <Box
                  sx={{
                    width: "100%",
                    height: "50px",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Button
                    onClick={() => setActiveAgent(null)}
                    variant="outlined"
                    sx={{
                      ml: 10,
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
                    Reset View
                  </Button>
                  <Button
                    onClick={handleToggleAgentBuilder}
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    sx={{
                      border: "2px solid #10b981",
                      color: "#fff",
                      backgroundColor: "#10b981",
                      boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        boxShadow: "0 0 15px rgba(16, 185, 129, 0.8)",
                        border: "2px solid #10b981",
                      },
                      padding: "8px 16px",
                      fontWeight: "medium",
                    }}
                  >
                    Create New Agent
                  </Button>
                </Box>
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
                      <Grid container spacing={3} sx={{ p: 2 }}>
                        {agents.map((agent) => (
                          <Grid
                            item
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            size={{ xs: 12, sm: 6, md: 4 }}
                            key={agent.id}
                          >
                            <Box
                              onClick={() => setActiveAgent(agent.id)}
                              sx={{
                                p: 3,
                                height: "100%",
                                width: "80%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                backgroundColor: "#0f172a",
                                borderRadius: "12px",
                                border: `2px solid ${agent.color}`,
                                boxShadow: `0 0 10px ${agent.color}`,
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "translateY(-5px)",
                                  boxShadow: `0 0 20px ${agent.color}`,
                                },
                              }}
                            >
                              <Box sx={{ color: agent.color, mb: 2 }}>
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
                                }}
                              >
                                {agent.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#94a3b8" }}
                              >
                                Click to activate {agent.title.toLowerCase()}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Grid>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Builder Modal */}
      <Dialog
        open={openAgentBuilder}
        onClose={handleToggleAgentBuilder}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "#0f172a",
            border: "2px solid #7c3aed",
            boxShadow: "0 0 20px #7c3aed",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#e2e8f0",
            borderBottom: "1px solid #334155",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create New Agent
          </Typography>
          <IconButton
            onClick={handleToggleAgentBuilder}
            sx={{ color: "#94a3b8" }}
          >
            <ArrowLeft size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <AgentBuilderForm onSuccess={handleAgentCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
}