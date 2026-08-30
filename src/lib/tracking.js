// Helper to get cookie value by name
export function getCookie(name) {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return undefined;
}

// Function to track Contact event across Meta Pixel, GTM DataLayer, and Server-Side CAPI
export function trackContactEvent(buttonLocation = "whatsapp_cta") {
  const eventId = "wa_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 1. Meta Pixel (Browser Event)
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq(
        "track",
        "Contact",
        {
          content_name: "WhatsApp Lead",
          content_category: "Contact",
          button_location: buttonLocation,
        },
        { eventID: eventId }
      );
    } catch (err) {
      console.error("Meta Pixel track error:", err);
    }
  }

  // 2. Google Tag Manager / Google Analytics (dataLayer)
  if (typeof window !== "undefined") {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "Contact",
        event_name: "Contact",
        event_category: "Engagement",
        event_action: "WhatsApp Click",
        event_label: buttonLocation,
        eventId: eventId,
      });
    } catch (err) {
      console.error("GTM dataLayer push error:", err);
    }
  }

  // 3. Meta Conversions API (Server-Side CAPI)
  if (typeof window !== "undefined") {
    try {
      const fbp = getCookie("_fbp");
      const fbc = getCookie("_fbc");
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get("fbclid");
      const finalFbc = fbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);

      const payload = JSON.stringify({
        eventId,
        eventSourceUrl: currentUrl,
        fbp,
        fbc: finalFbc,
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/capi", blob);
      } else {
        fetch("/api/capi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch((err) => console.error("CAPI send error:", err));
      }
    } catch (err) {
      console.error("Error dispatching CAPI tracking:", err);
    }
  }

  return eventId;
}
