type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const baseUrl = process.env.PAYPAL_BASE_URL!;

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error("Missing PayPal environment variables");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to get PayPal access token: ${text}`);
  }

  return JSON.parse(text) as PayPalAccessTokenResponse;
}

export async function createPayPalOrder(params: {
  amount: string;
  currency: string;
  description: string;
  referenceId: string;
}) {
  const tokenData = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL!;

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description,
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
        },
      ],
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to create PayPal order: ${text}`);
  }

  return JSON.parse(text);
}

export async function capturePayPalOrder(paypalOrderId: string) {
  const tokenData = await getPayPalAccessToken();
  const baseUrl = process.env.PAYPAL_BASE_URL!;

  const res = await fetch(
    `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed to capture PayPal order: ${text}`);
  }

  return JSON.parse(text);
}