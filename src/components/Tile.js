import { loadStripe } from "@stripe/stripe-js";
import supabase from "../../supabase";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Tile({ name, developer, price, description }) {
  const handleBuy = async () => {
    try {
      // ✅ Ensure product name is provided
      if (!name || name.trim() === "") {
        console.error("Error: Product name is required for Stripe checkout.");
        alert("Product name is required.");
        return;
      }

      // ✅ Fetch logged-in user from Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error);
        alert("You must be logged in to make a purchase.");
        return;
      }

      const userId = user.id; // Extract user ID

      console.log("Initiating checkout with:", { name, price, userId });

      // ✅ Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe failed to load.");
        return;
      }

      // ✅ Create a checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, userId }), // ✅ Include userId
      });

      const session = await response.json();
      if (!response.ok || session.error) {
        console.error("Error creating Stripe session:", session.error);
        alert(`Error: ${session.error}`);
        return;
      }

      console.log("Stripe Checkout session created:", session.id);

      // ✅ Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("handleBuy Error:", error);
      alert("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold">{developer || "Unnamed Product"}</h2>
      <p className="text-white mt-2">{description}</p>
      <p className="text-cyan-500 mt-2 font-bold">${price}</p>
      <button
        onClick={handleBuy}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
      >
        Buy
      </button>
    </div>
  );
}
