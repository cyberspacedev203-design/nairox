import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    console.log('PAYSTACK_SECRET_KEY exists:', !!PAYSTACK_SECRET_KEY);
    console.log('PAYSTACK_SECRET_KEY length:', PAYSTACK_SECRET_KEY?.length);
    console.log('PAYSTACK_SECRET_KEY starts with sk_live:', PAYSTACK_SECRET_KEY?.startsWith('sk_live'));

    if (!PAYSTACK_SECRET_KEY) {
      console.log('PAYSTACK_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });
    }

    // Fetch list of banks from Paystack
    const response = await fetch(
      "https://api.paystack.co/bank?country=NG",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('Paystack response status:', response.status);

    const data = await response.json();

    console.log('Paystack response data:', JSON.stringify(data, null, 2));
    console.log('Paystack response ok:', response.ok);
    console.log('Paystack data.status:', data.status);
    console.log('Paystack data.data:', data.data);
    console.log('Paystack data.data length:', data.data?.length);

    if (response.ok && data.status) {
      // Format banks for frontend: { name, code }
      const banks = data.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code.toString(),
      }));

      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
      return res.status(200).json({
        banks: banks.sort((a: any, b: any) => a.name.localeCompare(b.name)),
      });
    } else {
      return res.status(400).json({
        error: "Could not fetch banks from Paystack",
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
