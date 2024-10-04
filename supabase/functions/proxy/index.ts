import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");

  // OPTIONS 요청에 대한 처리
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (!symbol) {
    return new Response(JSON.stringify({ error: "Symbol is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const tokenResponse = await fetch(
    `${Deno.env.get("NEXT_PUBLIC_KIS_API_TOKEN_URL")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: Deno.env.get("NEXT_PUBLIC_KIS_API_KEY"),
        appsecret: Deno.env.get("NEXT_PUBLIC_KIS_API_SECRET"),
      }),
    },
  );

  if (!tokenResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to get token" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }

  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;

  const baseUrl = Deno.env.get("NEXT_PUBLIC_KIS_API_BASE_URL");
  const apiKey = Deno.env.get("NEXT_PUBLIC_KIS_API_KEY");
  const apiSecret = Deno.env.get("NEXT_PUBLIC_KIS_API_SECRET");

  if (!baseUrl || !apiKey || !apiSecret) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }

  const stockResponse = await fetch(
    `${baseUrl}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
        appkey: apiKey,
        appsecret: apiSecret,
        tr_id: "FHKST01010100",
      },
    },
  );

  if (!stockResponse.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch stock data" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }

  const stockData = await stockResponse.json();
  return new Response(JSON.stringify(stockData.output), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
});
