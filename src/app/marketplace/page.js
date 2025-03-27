"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Activity } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import Tile from "@/components/Tile";
import supabase from "../../../supabase";
export default function Dashboard() {
  const [aiAgents, setAiAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);

  // Dummy AI Agents Data
  const dummyData = [
    {
      id: 1,
      name: "AI Content Generator",
      developer: "Nikola",
      price: "49.99",
      description: "An advanced AI-powered content generator for automated blogging.",
    },
    {
      id: 2,
      name: "AI Chatbot",
      developer: "Elon",
      price: "19.99",
      description: "A smart chatbot for customer support and automation.",
    },
    {
      id: 3,
      name: "AI Stock Predictor",
      developer: "Warren",
      price: "99.99",
      description: "Predict stock trends using AI models.",
    },
    {
      id: 4,
      name: "AI Code Reviewer",
      developer: "Ada",
      price: "29.99",
      description: "AI-powered tool for reviewing and optimizing code.",
    },
  ];

  // Fetch AI Agents from Supabase
  useEffect(() => {
    async function fetchAiAgents() {
      setIsLoading(true);
      const { data, error } = await supabase.from("agents").select("*");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setAiAgents(data.length ? data : dummyData); // Use dummy data if empty
      }
      setIsLoading(false);
    }

    fetchAiAgents();
  }, []);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-lg">Loading AI Agents...</div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        <Header />

        <div className="grid grid-cols-12 gap-6">
          <SideBar />

          <div className="col-span-12 md:col-span-9 lg:col-span-10">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-slate-700/50 pb-3">
                <CardTitle className="text-slate-100 flex items-center text-3xl">
                  <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                  Marketplace
                </CardTitle>
              </CardHeader>

              <div className="grid grid-cols-2 gap-4 p-4">
                {aiAgents.map((agent) => (
                  <Tile
                    key={agent.id}
                    name={agent.name}
                    developer={agent.developer}
                    price={agent.price}
                    description={agent.description}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
