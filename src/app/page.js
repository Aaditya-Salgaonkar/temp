import { Button } from "@/components/ui/button";
import LandingNavBar from "@/components/LandingNavBar";
import FeatureCard from "@/components/FeatureCard";
import Testimonial from "@/components/Testimonial";

export default function Page() {
  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#1e1e2e] to-[#181825] text-white">
      {/* Navbar */}
      <LandingNavBar />

      {/* Hero Section */}
      <section className="text-center py-32 px-5 bg-gradient-to-b from-[#6a11cb] to-[#2575fc] text-white shadow-lg">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Build, Train & Monetize AI Agents
        </h1>
        <p className="mt-6 text-xl max-w-3xl mx-auto opacity-90">
          No-Code AI agent creation platform. Build AI workflows, integrate APIs, train models, and monetize with ease.
        </p>
        <Button className="mt-8 px-8 py-5 text-lg bg-white font-bold hover:bg-white text-black rounded-full shadow-md hover:scale-105 transition-transform">
          Get Started
        </Button>
      </section>

      {/* Key Features Section */}
      <section className="py-24 px-5 text-center">
        <h2 className="text-4xl font-semibold">Everything You Need to Build AI Agents</h2>
        <p className="mt-4 text-lg text-gray-400">No technical expertise required. Just drag, drop & launch.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
          {[
            { title: "No-Code AI Builder", desc: "Create AI workflows with an intuitive drag-and-drop interface." },
            { title: "Train Custom AI Models", desc: "Fine-tune GPT, LLaMA, or other LLMs for personalized responses." },
            { title: "Seamless API Integration", desc: "Connect AI agents with external databases, apps & automation tools." },
            { title: "Multi-Channel Deployment", desc: "Deploy AI agents on websites, WhatsApp, Discord & more." },
            { title: "Monetization Options", desc: "Sell AI agents via subscriptions, pay-per-use, or marketplace listings." },
            { title: "AI Marketplace", desc: "List and sell AI-powered tools in our global AI marketplace." }
          ].map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.desc}
              className="bg-gradient-to-br from-[#262631] to-[#1e1e2e] p-6 rounded-2xl shadow-lg hover:scale-105 transition-all"
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-5 text-center bg-[#1e1e2e] shadow-inner">
        <h2 className="text-4xl font-semibold">How It Works</h2>
        <p className="mt-4 text-lg text-gray-400">Start building AI agents in 3 easy steps.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
          {[
            { step: "1", title: "Create Your AI Agent", desc: "Use our No-Code AI builder to define workflows & logic." },
            { step: "2", title: "Train & Customize", desc: "Fine-tune AI models to deliver highly accurate responses." },
            { step: "3", title: "Monetize & Deploy", desc: "List on the AI marketplace or integrate with apps & websites." }
          ].map((item, index) => (
            <div key={index} className="p-8 bg-opacity-80 bg-[#262631] rounded-2xl shadow-lg hover:scale-105 transition-all">
              <span className="text-6xl font-extrabold text-[#6a11cb]">{item.step}</span>
              <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-5 text-center">
        <h2 className="text-4xl font-semibold">What AI Creators Say</h2>
        <p className="mt-4 text-lg text-gray-400">Loved by developers, entrepreneurs & businesses.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
          {[
            { name: "Sophia L.", feedback: "This platform made AI development effortless!" },
            { name: "David W.", feedback: "The best AI monetization platform I've used." },
            { name: "Emily T.", feedback: "Easiest way to deploy and sell AI agents!" }
          ].map((testimonial, index) => (
            <Testimonial
              key={index}
              name={testimonial.name}
              feedback={testimonial.feedback}
              className="bg-opacity-80 bg-[#262631] p-6 rounded-2xl shadow-lg hover:scale-105 transition-all"
            />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="py-24 px-5 text-center">
        <h2 className="text-4xl font-semibold">Choose Your Plan</h2>
        <p className="mt-4 text-lg text-gray-400">Flexible pricing for every AI creator.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
          {[
            { title: "Starter", price: "$9/mo", desc: "Basic AI tools", highlight: false },
            { title: "Pro", price: "$29/mo", desc: "Advanced AI features", highlight: true },
            { title: "Enterprise", price: "Contact us", desc: "Custom AI solutions", highlight: false }
          ].map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl shadow-lg hover:scale-105 transition-all ${
                plan.highlight ? "bg-gradient-to-br from-[#6a11cb] to-[#2575fc] text-white" : "bg-[#262631]"
              }`}
            >
              <h3 className="text-2xl font-semibold">{plan.title}</h3>
              <p className="mt-2 text-gray-400">{plan.desc}</p>
              <p className="mt-4 text-4xl font-bold">{plan.price}</p>
              <Button className="mt-6 w-full bg-white text-black rounded-full shadow-md hover:scale-105 transition-transform">
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="py-24 px-5 text-center bg-gradient-to-br from-[#6a11cb] to-[#2575fc] text-white shadow-lg">
        <h2 className="text-4xl font-semibold">Start Your AI Journey Today</h2>
        <p className="mt-4 text-lg">Build AI agents in minutes. No coding required.</p>
        <Button className="mt-6 px-8 py-5 text-lg bg-white text-black font-bold hover:bg-white rounded-full shadow-md hover:scale-105 transition-transform">
          Sign Up Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 text-center bg-[#181825] text-gray-500">
        <p>&copy; {new Date().getFullYear()} AgentForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
