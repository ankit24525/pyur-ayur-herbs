import crypto from "crypto";

export interface PhonePeSettings {
  version?: "v1" | "v2";
  clientId?: string;
  clientSecret?: string;
  clientVersion?: string;
  merchantId?: string;
  saltKey?: string;
  saltIndex?: string;
  env?: "sandbox" | "production";
  enabled?: boolean;
}

/**
 * Fetch OAuth access token for PhonePe Standard Checkout V2
 */
export async function getPhonePeV2Token(settings: PhonePeSettings): Promise<string> {
  const isProd = settings.env === "production";
  const tokenUrl = isProd
    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

  const clientId = settings.clientId || settings.merchantId || "";
  const clientSecret = settings.clientSecret || settings.saltKey || "";
  const clientVersion = settings.clientVersion || "1";

  if (!clientId || !clientSecret) {
    throw new Error("PhonePe Client ID and Client Secret must be configured in Admin Settings.");
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("client_version", clientVersion);
  params.append("grant_type", "client_credentials");

  console.log(`[PhonePe OAuth]: Requesting token from ${tokenUrl} for Client ID ${clientId}`);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json",
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.access_token) {
    console.error("[PhonePe OAuth Error]:", { status: res.status, data });
    const errMessage =
      data.error_description ||
      data.message ||
      data.error ||
      `PhonePe authentication failed with HTTP ${res.status}`;
    throw new Error(errMessage);
  }

  return data.access_token as string;
}

/**
 * Initiate PhonePe payment (supports both V2 Standard Checkout and V1 Legacy)
 */
export async function initiatePhonePePayment(params: {
  orderId: string;
  amountInPaise: number;
  phone: string;
  redirectUrl: string;
  settings: PhonePeSettings;
}): Promise<{ success: boolean; redirectUrl?: string; orderId: string; error?: string }> {
  const { orderId, amountInPaise, phone, redirectUrl, settings } = params;
  const isProd = settings.env === "production";

  const isV2 =
    settings.version !== "v1" &&
    (Boolean(settings.clientId) || Boolean(settings.clientSecret));

  if (isV2) {
    try {
      const accessToken = await getPhonePeV2Token(settings);

      const payUrl = isProd
        ? "https://api.phonepe.com/apis/pg/checkout/v2/pay"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

      const payload = {
        merchantOrderId: orderId,
        amount: amountInPaise,
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Order #${orderId}`,
          merchantUrls: {
            redirectUrl: redirectUrl,
          },
        },
      };

      console.log(`[PhonePe V2 Pay]: Initiating order ${orderId} at ${payUrl}`);

      const payRes = await fetch(payUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${accessToken}`,
          "accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const payData = await payRes.json().catch(() => ({}));
      console.log(`[PhonePe V2 Pay Response]:`, payData);

      const gatewayRedirectUrl =
        payData.redirectUrl ||
        payData.data?.redirectUrl ||
        payData.data?.instrumentResponse?.redirectInfo?.url;

      if (payRes.ok && gatewayRedirectUrl) {
        return {
          success: true,
          redirectUrl: gatewayRedirectUrl,
          orderId,
        };
      } else {
        const errorMsg =
          payData.message ||
          payData.error ||
          payData.description ||
          "Failed to initiate PhonePe payment.";
        return { success: false, orderId, error: errorMsg };
      }
    } catch (err: any) {
      console.error("[PhonePe V2 Pay Exception]:", err);
      return { success: false, orderId, error: err.message || "PhonePe payment initiation error" };
    }
  }

  // Legacy V1 Flow Fallback
  try {
    const merchantId = settings.merchantId || "PGBARCHUPGTEST";
    const saltKey = settings.saltKey || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const saltIndex = settings.saltIndex || "1";

    const phonepePayload = {
      merchantId,
      merchantTransactionId: orderId,
      merchantUserId: `USR-${phone.replace(/\D/g, "") || "GUEST"}`,
      amount: amountInPaise,
      redirectUrl: redirectUrl,
      redirectMode: "POST",
      callbackUrl: redirectUrl,
      mobileNumber: phone.replace(/\D/g, ""),
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payloadString = JSON.stringify(phonepePayload);
    const base64Payload = Buffer.from(payloadString).toString("base64");

    const checksumString = base64Payload + "/pg/v1/pay" + saltKey;
    const hash = crypto.createHash("sha256").update(checksumString).digest("hex");
    const xVerify = `${hash}###${saltIndex}`;

    const phonepeUrl = isProd
      ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    console.log(`[PhonePe V1 Pay]: Initiating order ${orderId} at ${phonepeUrl}`);

    const apiRes = await fetch(phonepeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "accept": "application/json",
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const resData = await apiRes.json().catch(() => ({}));

    if (apiRes.ok && resData.success && resData.data?.instrumentResponse?.redirectInfo?.url) {
      return {
        success: true,
        redirectUrl: resData.data.instrumentResponse.redirectInfo.url,
        orderId,
      };
    } else {
      console.error("[PhonePe V1 Error Response]:", resData);
      return {
        success: false,
        orderId,
        error: resData.message || "Failed to initialize payment gateway with PhonePe V1.",
      };
    }
  } catch (err: any) {
    console.error("[PhonePe V1 Exception]:", err);
    return { success: false, orderId, error: err.message || "PhonePe V1 payment error" };
  }
}

/**
 * Verify payment status of an order with PhonePe
 */
export async function verifyPhonePePayment(
  orderId: string,
  settings: PhonePeSettings
): Promise<{ success: boolean; state?: string; raw?: any; error?: string }> {
  const isProd = settings.env === "production";
  const isV2 =
    settings.version !== "v1" &&
    (Boolean(settings.clientId) || Boolean(settings.clientSecret));

  if (isV2) {
    try {
      const accessToken = await getPhonePeV2Token(settings);
      const statusUrl = isProd
        ? `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`
        : `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${orderId}/status`;

      console.log(`[PhonePe V2 Status Check]: Checking ${orderId} at ${statusUrl}`);

      const res = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `O-Bearer ${accessToken}`,
          "accept": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      console.log(`[PhonePe V2 Status Response]:`, data);

      const state = (data.state || data.data?.state || data.code || "").toUpperCase();
      const isSuccess =
        state === "COMPLETED" ||
        state === "SUCCESS" ||
        data.success === true;

      return {
        success: isSuccess,
        state,
        raw: data,
      };
    } catch (err: any) {
      console.error("[PhonePe V2 Status Exception]:", err);
      return { success: false, state: "ERROR", error: err.message };
    }
  }

  // Legacy V1 Status Check
  try {
    const merchantId = settings.merchantId || "PGBARCHUPGTEST";
    const saltKey = settings.saltKey || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const saltIndex = settings.saltIndex || "1";

    const checksumString = `/pg/v1/status/${merchantId}/${orderId}${saltKey}`;
    const hash = crypto.createHash("sha256").update(checksumString).digest("hex");
    const xVerify = `${hash}###${saltIndex}`;

    const phonepeStatusUrl = isProd
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${orderId}`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${orderId}`;

    console.log(`[PhonePe V1 Status Check]: Checking ${orderId} at ${phonepeStatusUrl}`);

    const verifyRes = await fetch(phonepeStatusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": merchantId,
        "accept": "application/json",
      },
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    const isSuccess =
      verifyData.success &&
      (verifyData.code === "PAYMENT_SUCCESS" || verifyData.data?.responseCode === "SUCCESS");

    return {
      success: isSuccess,
      state: verifyData.code,
      raw: verifyData,
    };
  } catch (err: any) {
    console.error("[PhonePe V1 Status Exception]:", err);
    return { success: false, state: "ERROR", error: err.message };
  }
}
