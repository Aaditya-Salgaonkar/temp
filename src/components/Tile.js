import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Tile({ name, developer, price, description }) {
  const handleBuy = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      console.error("Stripe failed to load.");
      return;
    }

    // Create a checkout session
    const response = await fetch("api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    });

    const session = await response.json();
    if (session.error) {
      console.error(session.error);
      return;
    }

    // Redirect to Stripe Checkout
    stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-gray-400">by {developer}</p>
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
