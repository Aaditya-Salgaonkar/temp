"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "@mui/icons-material";
import supabase from "../../../supabase";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      router.push("/home");
    }
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      sessionStorage.setItem("token", data.session.access_token);
      router.push("/home");
      router.refresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col justify-center items-center px-6 md:px-16">
      <div className="w-full max-w-md">
        <Card className="p-8 bg-gray-900 shadow-lg rounded-xl">
          <CardContent>
            <Link href="/" className="flex items-center">
              <ArrowLeft sx={{ fontSize: 32, color: "white" }} />
            </Link>
            <h2 className="text-3xl font-bold text-center text-blue-400">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-center">
              Log in to access your dashboard
            </p>

            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-gray-300 text-sm">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1 p-3 bg-gray-800 text-white border border-gray-700 rounded-lg w-full"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1 p-3 bg-gray-800 text-white border border-gray-700 rounded-lg w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 text-lg w-full rounded-lg"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <p className="text-center text-gray-400 mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
