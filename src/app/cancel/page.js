"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For Next.js 13+

export default function Cancel() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/marketplace"); // Change the path if needed
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-900 text-white">
      <h1 className="text-2xl font-bold">❌ Payment Cancelled</h1>
      <p className="mt-2">Try again later.</p>
      <p className="mt-4">Redirecting you to the dashboard...</p>
    </div>
  );
}
