"use client"

import { useEffect, useState, useRef } from "react"
import { Activity, Cpu, Database, DollarSign, Layers, LineChart, Settings, Users, Zap } from "lucide-react"
import Header from "@/components/Header"
import SideBar from "@/components/SideBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bar, Line } from "react-chartjs-2"
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';

Chart.register(CategoryScale);
export default function Dashboard() {
  const [aiAgents, setAiAgents] = useState(12)
  const [revenue, setRevenue] = useState(2500)
  const [subscribers, setSubscribers] = useState(320)
  const [cpuUsage, setCpuUsage] = useState(48)
  const [trainingStatus, setTrainingStatus] = useState(76)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      setCpuUsage(Math.floor(Math.random() * 30) + 30)
      setTrainingStatus(Math.floor(Math.random() * 20) + 60)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-5">
      {/* Header */}
      <Header />
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <SideBar />

          {/* Main Dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <div className="grid gap-6">
              {/* Overview Cards */}
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
                      <DollarSign className="text-green-500 mr-2" />
                      Revenue
                    </CardTitle>
                    <span className="text-lg font-bold">${revenue}</span>
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

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Database className="text-red-500 mr-2" />
                      Training Progress
                    </CardTitle>
                    <Progress value={trainingStatus} />
                  </CardHeader>
                </Card>
              </div>

              {/* Graphs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>AI Agent Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line
                      data={{
                        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                        datasets: [
                          {
                            label: "Active AI Agents",
                            data: [5, 8, 12, 14, 18],
                            borderColor: "rgba(0, 150, 255, 0.8)",
                            fill: false,
                          },
                        ],
                      }}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar
                      data={{
                        labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                        datasets: [
                          {
                            label: "Revenue ($)",
                            data: [1000, 1800, 2500, 3100, 4000],
                            backgroundColor: "rgba(50, 255, 50, 0.8)",
                          },
                        ],
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* AI Agent Builder Section */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>
                    <Layers className="mr-2" />
                    No-Code AI Agent Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Drag and drop components to create AI workflows.</p>
                  <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Builder
                  </button>
                </CardContent>
              </Card>

              {/* Marketplace Section */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>
                    <Zap className="mr-2 text-purple-500" />
                    AI Agent Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Sell and monetize your AI agents via subscriptions or pay-per-use models.
                  </p>
                  <button className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Go to Marketplace
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
