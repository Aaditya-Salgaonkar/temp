import { loadStripe } from "@stripe/stripe-js";
import supabase from "../../supabase";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCallback } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Tile({ name, developer, price, description, isOwner, productId, onRemove }) {
  // ✅ Handle checkout process
  const handleCheckout = useCallback(async () => {
    if (!name?.trim()) {
      console.error("Error: Product name is required for Stripe checkout.");
      alert("Product name is required.");
      return;
    }

    if (!price || price <= 0) {
      console.error("Error: Invalid product price.");
      alert("Invalid product price.");
      return;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Error fetching user:", error);
        alert("You must be logged in to make a purchase.");
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Error: Stripe failed to load.");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, userId: user.id }),
      });

      const session = await response.json();
      if (!response.ok || session.error) {
        console.error("Error creating Stripe session:", session.error);
        alert(`Error: ${session.error}`);
        return;
      }

      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error("handleCheckout Error:", error);
      alert("Something went wrong! Please try again.");
    }
  }, [name, price]);

  // ✅ Handle remove from marketplace
  const handleRemove = async () => {
    if (!productId) {
      alert("Invalid product ID.");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to remove this item?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) {
        console.error("Error deleting product:", error);
        alert("Failed to remove product.");
        return;
      }

      alert("Product removed successfully.");
      onRemove?.(); // ✅ Refresh product list after deletion
    } catch (error) {
      console.error("handleRemove Error:", error);
      alert("Something went wrong while removing the product.");
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold">{developer || "Unnamed Product"}</h2>
      <p className="text-white mt-2">{description}</p>
      <p className="text-cyan-500 mt-2 font-bold">₹{price}</p>

      <div className="mt-4 flex space-x-2">
        {isOwner ? (
          <button
            onClick={handleRemove}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Remove from Marketplace
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
