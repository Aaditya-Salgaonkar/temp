import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function LandingNavBar() {
  return (
    <div className="flex flex-row justify-between px-10 py-5">
      <h1 className="text-primary font-bold text-3xl">AgentForge AI</h1>
      <div className="flex flex-row gap-5">
      <Link href={"/signup"}><Button className="font-bold text-md hover:shadow-primary shadow-md">Sign Up</Button></Link>
      <Link href={"/login"}><Button className="font-bold text-md bg-invert text-primary border-2 hover:bg-black hover:shadow-primary shadow-md">Login</Button></Link>
      </div>
    </div>
  );
}
