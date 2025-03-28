"use client";

import { useEffect, useState, useRef } from "react";
import { Cpu, IndianRupee, Users } from "lucide-react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "../../../supabase";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState("dark");
  const [aiAgents, setAiAgents] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [fineTuningData, setFineTuningData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

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
          .select("amount, created_at")
          .eq("payment_status", "completed")
          .in("agent_id", agentIds);

        if (revenueError) throw revenueError;

        const totalRevenue = revenueData.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        setRevenue(Math.round(totalRevenue)); 

        // Extract data for revenue chart (e.g., monthly data)
        const revenueChartData = revenueData.map(item => ({
          date: new Date(item.created_at).toLocaleDateString(),
          amount: item.amount,
        }));

        setRevenueData(revenueChartData);

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

  // Fine-tuning graph data
  const fineTuningChartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'AI Fine-Tuning Progress',
        data: [20, 40, 60, 80, 100],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Revenue chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // Hardcoded months
    datasets: [
      {
        label: 'Revenue Over Time',
        data: [5000, 8000, 12000, 15000, 20000, 22000, 25000], // Hardcoded revenue amounts
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };
  

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {/* Graphs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl">Revenue Over Time</CardTitle>
                      </CardHeader>
                      <div className="p-4">
                        <Line data={revenueChartData} />
                      </div>
                    </Card>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-xl">AI Fine-Tuning Progress</CardTitle>
                      </CardHeader>
                      <div className="p-4">
                        <Bar data={fineTuningChartData} />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
