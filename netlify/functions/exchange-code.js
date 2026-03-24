const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const CLIENT_ID = "1395739162635800789";
const REDIRECT_URI = "https://bdtools.netlify.app/api";
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

function generateApiKey(userId) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { code } = JSON.parse(event.body);
    if (!code) {
      return { statusCode: 400, body: JSON.stringify({ error: "No code provided" }) };
    }

    console.log("Exchanging code for token...");
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      console.error("Token error:", tokenData);
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid token exchange" }) };
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    if (!userData.id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Failed to fetch user data" }) };
    }

    const apiKey = `BDTools-${generateApiKey(userData.id)}`;
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar,
          discriminator: userData.discriminator,
        },
        apiKey,
      }),
    };
  } catch (err) {
    console.error("Error in /exchange-code:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
};