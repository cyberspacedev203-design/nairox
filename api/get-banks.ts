import type { VercelRequest, VercelResponse } from "@vercel/node";

// Cache for banks data
let cachedBanks: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check cache first
    const now = Date.now();
    if (cachedBanks && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached banks:', cachedBanks.length);
      return res.status(200).json({
        banks: cachedBanks,
        cached: true
      });
    }

    // Retrieve API Key
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

    console.log('PAYSTACK_SECRET_KEY exists:', !!PAYSTACK_SECRET_KEY);
    console.log('PAYSTACK_SECRET_KEY length:', PAYSTACK_SECRET_KEY?.length);
    console.log('PAYSTACK_SECRET_KEY starts with sk_live:', PAYSTACK_SECRET_KEY?.startsWith('sk_live'));

    if (!PAYSTACK_SECRET_KEY) {
      console.log('PAYSTACK_SECRET_KEY is not set in environment variables');
      return res.status(500).json({ error: "PAYSTACK_SECRET_KEY not configured" });
    }

    // Make API Request
    console.log('Making request to Paystack API...');
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Accept": "application/json",
      },
    });

    console.log('Paystack response status:', response.status);
    console.log('Paystack response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Paystack error response:', errorText);
      return res.status(response.status).json({
        error: "Failed to fetch banks from Paystack",
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Paystack response data:', JSON.stringify(data, null, 2));

    if (!data.status) {
      console.log('Paystack returned status false');
      return res.status(400).json({
        error: "Paystack API returned error",
        details: data.message || "Unknown error"
      });
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.log('Paystack returned invalid data structure');
      return res.status(400).json({
        error: "Invalid response from Paystack",
        details: "No data array returned"
      });
    }

    // Process Bank Data
    const banks = data.data.map((bank: any) => ({
      name: bank.name || bank.bank_name || bank.bank,
      code: bank.code || bank.bank_code,
    })).filter((bank: any) => bank.name && bank.code);

    console.log('Processed banks count:', banks.length);
    console.log('First few banks:', banks.slice(0, 3));

    // Cache and Return
    cachedBanks = banks;
    cacheTimestamp = now;

    res.setHeader("Cache-Control", "public, max-age=43200"); // Cache for 12 hours
    return res.status(200).json({
      banks: banks,
      cached: false,
      count: banks.length
    });

  } catch (error) {
    console.error("Error fetching banks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
