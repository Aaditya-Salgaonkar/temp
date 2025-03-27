import supabase from "../../../supabase";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { agent_id, price } = req.body;

    const { data, error } = await supabase.from("monetization").insert([
      {
        agent_id,
        price,
        pay_per_use: false,
        marketplace_listing: true,
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: "Agent monetized", data });
  }

  res.status(405).json({ message: "Method not allowed" });
}
