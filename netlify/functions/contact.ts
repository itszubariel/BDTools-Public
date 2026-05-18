interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string>;
}

interface NetlifyResponse {
  statusCode: number;
  body: string;
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface DiscordEmbedFooter {
  text: string;
}

interface DiscordEmbed {
  title: string;
  color: number;
  fields: DiscordEmbedField[];
  footer: DiscordEmbedFooter;
  timestamp: string;
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

export const handler = async (
  event: NetlifyEvent,
): Promise<NetlifyResponse> => {
  console.log("[contact] 🔔 Handler triggered");

  // --- Method check ---
  if (event.httpMethod !== "POST") {
    console.warn(`[contact] ⚠️  Invalid HTTP method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  // --- Env check ---
  const webhookURL = process.env.WEBHOOK_URL;
  if (!webhookURL) {
    console.error("[contact] ❌ Missing WEBHOOK_URL environment variable");
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server misconfiguration: webhook URL not set.",
      }),
    };
  }

  // --- Parse body ---
  let data: unknown;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    console.error(
      "[contact] ❌ Failed to parse request body:",
      (err as Error).message,
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  // --- Validate required fields ---
  const {
    discord,
    email,
    topic,
    subject,
    msg,
  }: {
    discord?: string;
    email?: string;
    topic?: string;
    subject?: string;
    msg?: string;
  } = data as {
    discord?: string;
    email?: string;
    topic?: string;
    subject?: string;
    msg?: string;
  };

  if (!subject || !msg) {
    console.warn(
      "[contact] ⚠️  Missing required fields — subject and msg are required",
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Subject and message are required." }),
    };
  }

  console.log(
    `[contact] 📨 Incoming contact form — subject: "${subject}", topic: "${topic || "N/A"}", from: "${discord || "anonymous"}"`,
  );

  const payload: DiscordWebhookPayload = {
    embeds: [
      {
        title: `New Contact Message — ${subject}`,
        color: 0x4f46e5,
        fields: [
          { name: "Discord", value: discord || "N/A", inline: true },
          { name: "Email", value: email || "N/A", inline: true },
          { name: "Topic", value: topic || "N/A", inline: false },
          { name: "Message", value: msg || "N/A", inline: false },
        ],
        footer: { text: "BDTools Contact Form" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // --- Send to Discord ---
  console.log("[contact] 🚀 Sending payload to Discord webhook...");
  let res: Response;
  try {
    res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(
      "[contact] ❌ Network error sending to Discord webhook:",
      (err as Error).message,
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to reach Discord. Please try again.",
      }),
    };
  }

  if (!res.ok) {
    let errorText = "";
    try {
      errorText = await res.text();
    } catch (_) { }
    console.error(
      `[contact] ❌ Discord webhook rejected the request (HTTP ${res.status}): ${errorText}`,
    );
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: `Discord webhook failed with status ${res.status}.`,
      }),
    };
  }

  console.log(
    "[contact] 🎉 Contact form message delivered to Discord successfully",
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};