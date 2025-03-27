import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { name, price, userId } = await req.json();

    // ✅ Validate input fields
    if (!name || !price || !userId) {
      console.error("Error: Missing required fields.", { name, price, userId });
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    console.log("Processing checkout for:", { name, price, userId });

    // ✅ Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
      metadata: { userId },
    });

    console.log("Checkout session created successfully:", session.id);
    return NextResponse.json({ id: session.id }, { status: 200 });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
