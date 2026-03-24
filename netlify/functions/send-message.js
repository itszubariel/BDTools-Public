export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const webhookURL = process.env.WEBHOOK_URL;

    if (!webhookURL) {
      return { statusCode: 500, body: "Webhook URL not set." };
    }

    const payload = {
      embeds: [
        {
          title: `New Contact Message - ${data.subject}`,
          color: 0x4f46e5,
          fields: [
            { name: "Display Name", value: data.displayName || "N/A", inline: true },
            { name: "Username", value: data.username || "N/A", inline: true },
            { name: "Email", value: data.email || "N/A", inline: false },
            { name: "Topic", value: data.topic || "N/A", inline: true },
            { name: "Message", value: data.message || "N/A" }
          ],
          footer: { text: "BDTools Contact Form" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Discord webhook failed: ${res.status} ${text}`);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
}