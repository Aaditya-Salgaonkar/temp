"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Fetch agents
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("*");

      // Fetch marketplace items
      const { data: marketplace, error: marketplaceError } = await supabase
        .from("marketplace")
        .select("*");

      if (agentsError) console.error("Error fetching agents:", agentsError);
      if (marketplaceError) console.error("Error fetching marketplace:", marketplaceError);

      // Merge agents & marketplace by `agent_id`
      const mergedData = marketplace.map((item) => {
        const agent = agents.find((a) => a.id === item.agent_id);
        return {
          ...item,
          agent_name: agent ? agent.name : "Unknown Agent",
          agent_type: agent ? agent.agent_type : "N/A",
          finetuning_data: agent ? agent.finetuning_data : "N/A",
        };
      });

      setData(mergedData);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative">
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <Loader2 className="animate-spin text-cyan-400 h-10 w-10" />
          <p className="mt-2 text-lg">Fetching Marketplace Data...</p>
        </div>
      )}

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
  name={item.category || "Unnamed Product"} // Ensuring name is not empty
  developer={item.agent_name}
  price={item.price}
  description={`Agent Type: ${item.agent_type} | Fine-Tuning Data: ${item.finetuning_data}`}
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
  );
}
