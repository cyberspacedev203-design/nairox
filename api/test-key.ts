import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        error: "PAYSTACK_SECRET_KEY not configured",
        env: {
          PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
          NEXT_PUBLIC_PAYSTACK_SECRET_KEY: !!process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY
        }
      });
    }

    // Test the key with balance endpoint
    const testResponse = await fetch("https://api.paystack.co/balance", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Accept": "application/json",
      },
    });

    const testData = await testResponse.json();

    return res.status(200).json({
      keyConfigured: true,
      keyLength: PAYSTACK_SECRET_KEY.length,
      keyStartsWith: PAYSTACK_SECRET_KEY.substring(0, 10) + '...',
      balanceTest: {
        status: testResponse.status,
        ok: testResponse.ok,
        data: testData
      }
    });

  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({ error: "Test failed", details: error.message });
  }
}