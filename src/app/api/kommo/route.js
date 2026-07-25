import { NextResponse } from "next/server";

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
