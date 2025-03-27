"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Bot, Command, Globe, ShoppingBag } from "lucide-react";
export default function SideBar() {
  const pathname = usePathname(); // Get current route

  return (
    <div className="col-span-12 md:col-span-3 lg:col-span-2">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <nav className="space-y-2">
            <NavItem href="/home" icon={Command} label="Dashboard" active={pathname === "/home"} />
            <NavItem href="/marketplace" icon={Globe} label="Store" active={pathname === "/marketplace"} />
            <NavItem href="/agentbuilder" icon={Bot} label="Agent Builder" active={pathname === "/agentbuilder"} />
            <NavItem href="/myagents" icon={ShoppingBag} label="Purchased AI Agents" active={pathname === "/myagents"} />
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for nav items
function NavItem({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} passHref>
      <Button
        variant="ghost"
        className={`w-full justify-start transition-colors ${
          active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"
        }`}
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}
