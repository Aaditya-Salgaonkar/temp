"use client";

import { useEffect, useState } from "react";
import { Cpu, IndianRupee, Users } from "lucide-react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "../../../supabase";

export default function Dashboard() {
  const [aiAgents, setAiAgents] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [subscribers, setSubscribers] = useState(0);

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

  return (
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
  );
}
