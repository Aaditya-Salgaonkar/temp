"use client"

import { useEffect, useState, useRef } from "react"
import {
  Activity,
  Edit,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Header from "@/components/Header"
import SideBar from "@/components/SideBar"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const [theme, setTheme] = useState("dark")
  const [aiAgents, setAiAgents] = useState([
    { name: "ChatBot Pro", category: "Customer Support", status: "Active", date: "Mar 10, 2025", revenue: 1250, plan: "Premium" },
    { name: "Finance GPT", category: "Finance Advisory", status: "Active", date: "Feb 28, 2025", revenue: 980, plan: "Basic" },
    { name: "Code Assistant", category: "Developer Tools", status: "Inactive", date: "Jan 15, 2025", revenue: 720, plan: "Standard" },
    { name: "Content AI", category: "Content Generation", status: "Active", date: "Mar 5, 2025", revenue: 1890, plan: "Enterprise" },
  ])

  const canvasRef = useRef(null)

  // Particle effect background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = []
    const particleCount = 100

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Remove AI agent
  const removeAgent = (index) => {
    setAiAgents(aiAgents.filter((_, i) => i !== index))
  }

  // Toggle AI agent status
  const toggleStatus = (index) => {
    setAiAgents((prev) =>
      prev.map((agent, i) =>
        i === index ? { ...agent, status: agent.status === "Active" ? "Inactive" : "Active" } : agent
      )
    )
  }

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <Header />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <SideBar />

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="grid gap-6">

              {/* Purchased AI Agents Table */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                      Purchased AI Agents
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-slate-300">
                          <th className="p-3 border-b border-slate-700">Agent Name</th>
                          <th className="p-3 border-b border-slate-700">Category</th>
                          <th className="p-3 border-b border-slate-700">Status</th>
                          <th className="p-3 border-b border-slate-700">Purchase Date</th>
                          <th className="p-3 border-b border-slate-700">Plan</th>
                          <th className="p-3 border-b border-slate-700">Cost</th>
                          <th className="p-3 border-b border-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiAgents.map((agent, index) => (
                          <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                            <td className="p-3">{agent.name}</td>
                            <td className="p-3">{agent.category}</td>
                            <td className="p-3">
                              <Badge variant={agent.status === "Active" ? "success" : "destructive"}>
                                {agent.status}
                              </Badge>
                            </td>
                            <td className="p-3">{agent.date}</td>
                            <td className="p-3">{agent.plan}</td>
                            <td className="p-3 text-green-400">${agent.revenue}</td>
                            <td className="p-3 flex space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button size="icon" variant="ghost" onClick={() => toggleStatus(index)}>
                                      {agent.status === "Active" ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{agent.status === "Active" ? "Deactivate" : "Activate"}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button size="icon" variant="ghost" onClick={() => removeAgent(index)}>
                                <Trash2 className="text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
