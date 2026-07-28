import { NextResponse } from "next/server";
import crypto from "crypto";

function hashData(data) {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, phone } = data;

    const subdomain = process.env.KOMMO_SUBDOMAIN;
    const accessToken = process.env.KOMMO_ACCESS_TOKEN;

    if (!subdomain || !accessToken) {
      console.error("Kommo CRM credentials missing in environment variables.");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const pipelineId = process.env.KOMMO_PIPELINE_ID;
    const statusId = process.env.KOMMO_STATUS_ID;

    // Endpoint para criar Lead e Contato simultaneamente no Kommo
    const url = `https://${subdomain}.kommo.com/api/v4/leads/complex`;

    const leadObject = {
      name: `Lead: ${name}`,
      _embedded: {
          contacts: [
            {
              first_name: name,
              custom_fields_values: [
                {
                  field_code: "PHONE",
                  values: [{ value: phone }],
                },
                {
                  field_code: "EMAIL",
                  values: [{ value: email }],
                },
              ],
            },
          ],
        },
    };
    if (pipelineId) leadObject.pipeline_id = parseInt(pipelineId);
    if (statusId) leadObject.status_id = parseInt(statusId);

    const kommoPayload = [leadObject];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(kommoPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Kommo API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to create lead in CRM" },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("Kommo Lead created successfully:", responseData);

    // Meta Conversions API setup
    const metaToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID;
    
    if (metaToken && pixelId) {
      try {
        const metaPayload = {
          data: [
            {
              event_name: "Contact",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: {
                em: [hashData(email)],
                ph: [hashData(phone)],
              },
            }
          ]
        };

        const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${metaToken}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(metaPayload)
        });

        if (!metaResponse.ok) {
          console.error("Meta CAPI Error:", await metaResponse.text());
        } else {
          console.log("Meta CAPI Event sent successfully");
        }
      } catch (metaError) {
        console.error("Error sending event to Meta CAPI:", metaError);
      }
    }

    return NextResponse.json(
      { message: "Lead saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving lead to Kommo:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
