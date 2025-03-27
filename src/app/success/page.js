"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For Next.js 13+

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/marketplace"); // Change the path if needed
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-900 text-white">
      <h1 className="text-2xl font-bold">🎉 Payment Successful!</h1>
      <p className="mt-2">Thank you for your purchase.</p>
      <p className="mt-4">Redirecting you to the dashboard...</p>
    </div>
  );
}
