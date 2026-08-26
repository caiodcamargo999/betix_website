import { NextResponse } from "next/server";
import crypto from "crypto";

function hashData(data) {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

function normalizePhone(rawPhone) {
  if (!rawPhone) return undefined;
  // Remove any non-numeric character
  let clean = rawPhone.toString().replace(/\D/g, "");
  if (!clean) return undefined;

  // Handle Israeli local numbers (e.g. 055... -> 97255...)
  if (clean.startsWith("05") && clean.length === 10) {
    clean = "972" + clean.substring(1);
  }

  return clean;
}

// Helper to fetch contact details from Kommo if phone not in webhook body
async function fetchKommoContact(contactId) {
  const subdomain = process.env.KOMMO_SUBDOMAIN;
  const accessToken = process.env.KOMMO_ACCESS_TOKEN;

  if (!subdomain || !accessToken || !contactId) return null;

  try {
    const res = await fetch(`https://${subdomain}.kommo.com/api/v4/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching Kommo contact:", err);
    return null;
  }
}

// Helper to fetch lead with contacts from Kommo
async function fetchKommoLead(leadId) {
  const subdomain = process.env.KOMMO_SUBDOMAIN;
  const accessToken = process.env.KOMMO_ACCESS_TOKEN;

  if (!subdomain || !accessToken || !leadId) return null;

  try {
    const res = await fetch(`https://${subdomain}.kommo.com/api/v4/leads/${leadId}?with=contacts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching Kommo lead:", err);
    return null;
  }
}

export async function POST(request) {
  try {
    let rawBody = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      rawBody = await request.json().catch(() => ({}));
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        rawBody = {};
        for (const [key, value] of formData.entries()) {
          rawBody[key] = value;
        }
      } else {
        const text = await request.text().catch(() => "");
        const params = new URLSearchParams(text);
        rawBody = Object.fromEntries(params.entries());
      }
    } else {
      const text = await request.text().catch(() => "");
      try {
        rawBody = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        rawBody = Object.fromEntries(params.entries());
      }
    }

    console.log("Kommo Webhook received:", JSON.stringify(rawBody));

    let phone = undefined;
    let email = undefined;
    let firstName = undefined;
    let leadId = undefined;

    // Search for lead_id or contact details in webhook payload
    // 1. Direct JSON format
    if (rawBody.leads?.add?.[0]) {
      const lead = rawBody.leads.add[0];
      leadId = lead.id;
      firstName = lead.name;
    } else if (rawBody["leads[add][0][id]"]) {
      leadId = rawBody["leads[add][0][id]"];
      firstName = rawBody["leads[add][0][name]"];
    }

    // 2. Direct contact in webhook
    if (rawBody.contacts?.add?.[0]) {
      const contact = rawBody.contacts.add[0];
      firstName = firstName || contact.name;
      // check custom fields for phone
      if (contact.custom_fields) {
        for (const f of contact.custom_fields) {
          if (f.code === "PHONE" || f.id === "PHONE") {
            phone = f.values?.[0]?.value || f.values?.[0];
          }
          if (f.code === "EMAIL" || f.id === "EMAIL") {
            email = f.values?.[0]?.value || f.values?.[0];
          }
        }
      }
    }

    // 3. If phone not found yet and we have a leadId, fetch from Kommo API
    if (!phone && leadId) {
      const leadData = await fetchKommoLead(leadId);
      const contactItem = leadData?._embedded?.contacts?.[0];
      if (contactItem?.id) {
        const contactData = await fetchKommoContact(contactItem.id);
        if (contactData?.custom_fields_values) {
          for (const f of contactData.custom_fields_values) {
            if (f.field_code === "PHONE") {
              phone = f.values?.[0]?.value;
            }
            if (f.field_code === "EMAIL") {
              email = f.values?.[0]?.value;
            }
          }
        }
        firstName = firstName || contactData?.first_name || contactData?.name;
      }
    }

    const cleanPhone = normalizePhone(phone);
    console.log(`Processing Lead for Meta CAPI. Lead ID: ${leadId || "N/A"}, Phone: ${cleanPhone ? "[EXISTS]" : "None"}`);

    // Send Meta Conversions API (CAPI)
    const metaToken = process.env.META_ACCESS_TOKEN;
    const pixelId = process.env.META_PIXEL_ID || "1634810871771318";

    if (metaToken) {
      const userData = {};
      if (cleanPhone) userData.ph = [hashData(cleanPhone)];
      if (email) userData.em = [hashData(email)];
      if (firstName) userData.fn = [hashData(firstName)];

      const metaPayload = {
        data: [
          {
            event_name: "Contact",
            event_time: Math.floor(Date.now() / 1000),
            event_id: `kommo_lead_${leadId || Date.now()}`,
            action_source: "business_messaging",
            user_data: userData,
            custom_data: {
              lead_id: leadId ? String(leadId) : undefined,
              channel: "whatsapp",
            },
          },
        ],
      };

      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${metaToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(metaPayload),
          }
        );

        const metaResult = await metaRes.json();
        console.log("Meta CAPI response from Kommo Webhook:", metaResult);
      } catch (metaErr) {
        console.error("Error sending Meta CAPI from Kommo Webhook:", metaErr);
      }
    } else {
      console.warn("Meta CAPI skipped: META_ACCESS_TOKEN is not configured.");
    }

    return NextResponse.json(
      { success: true, processedLeadId: leadId || null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/kommo/webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
