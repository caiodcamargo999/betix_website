import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventId, eventSourceUrl, fbp, fbc } = body;

    const metaToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID || "1634810871771318";

    // Extract client IP & User Agent from request
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : request.headers.get("x-real-ip") || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    if (!metaToken) {
      console.warn("Meta CAPI: META_ACCESS_TOKEN is not configured in environment variables.");
      return NextResponse.json(
        { message: "Meta CAPI skipped (no token configured)" },
        { status: 200 }
      );
    }

    const userData = {};
    if (clientIp) userData.client_ip_address = clientIp;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;

    const metaPayload = {
      data: [
        {
          event_name: "Contact",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || `wa_${Date.now()}`,
          event_source_url: eventSourceUrl || undefined,
          action_source: "website",
          user_data: userData,
        },
      ],
    };

    const metaResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${metaToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metaPayload),
      }
    );

    if (!metaResponse.ok) {
      const errorData = await metaResponse.text();
      console.error("Meta CAPI Error Response:", errorData);
      return NextResponse.json(
        { error: "Failed to send Meta CAPI event", details: errorData },
        { status: 500 }
      );
    }

    const responseData = await metaResponse.json();
    console.log("Meta CAPI Event sent successfully:", responseData);

    return NextResponse.json(
      { success: true, meta: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/capi route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
