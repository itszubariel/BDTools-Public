import jwt from "jsonwebtoken";

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string>;
}

interface NetlifyResponse {
  statusCode: number;
  body: string;
}

interface DiscordTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface DiscordUser {
  id?: string;
  username?: string;
  avatar?: string;
  discriminator?: string;
}

const CLIENT_ID = "1395739162635800789";
const REDIRECT_URI = "https://bdtools.xyz/docs";
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

function generateApiKey(userId: string): string {
  if (!userId)
    throw new Error(
      "[exchange-code] ❌ Cannot generate API key: userId is missing",
    );
  const payload = { sub: userId, iat: Math.floor(Date.now() / 1000) };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "30d" });
}

export const handler = async (
  event: NetlifyEvent,
): Promise<NetlifyResponse> => {
  console.log("[exchange-code] 🔔 Handler triggered");

  if (event.httpMethod !== "POST") {
    console.warn("[exchange-code] ⚠️  Invalid method:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let code: string;
  try {
    ({ code } = JSON.parse(event.body || "{}") as { code: string });
  } catch (err) {
    console.error(
      "[exchange-code] ❌ Failed to parse request body:",
      (err as Error).message,
    );
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!code) {
    console.warn("[exchange-code] ⚠️  No OAuth code provided in request body");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No code provided" }),
    };
  }

  if (!CLIENT_SECRET) {
    console.error(
      "[exchange-code] ❌ Missing CLIENT_SECRET environment variable",
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfiguration" }),
    };
  }

  if (!JWT_SECRET) {
    console.error("[exchange-code] ❌ Missing JWT_SECRET environment variable");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfiguration" }),
    };
  }

  // Step 1: Exchange code for Discord access token
  console.log(
    "[exchange-code] 🔄 Exchanging OAuth code for Discord access token...",
  );
  let tokenData: DiscordTokenResponse;
  try {
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

    tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

    if (tokenData.error) {
      console.error(
        "[exchange-code] ❌ Discord token exchange failed:",
        tokenData.error,
        tokenData.error_description || "",
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid token exchange" }),
      };
    }

    console.log("[exchange-code] ✅ Discord access token obtained");
  } catch (err) {
    console.error(
      "[exchange-code] ❌ Network error during token exchange:",
      (err as Error).message,
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to contact Discord" }),
    };
  }

  // Step 2: Fetch Discord user info
  console.log("[exchange-code] 👤 Fetching Discord user info...");
  let userData: DiscordUser;
  try {
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    userData = (await userResponse.json()) as DiscordUser;

    if (!userData.id) {
      console.error(
        "[exchange-code] ❌ Discord user fetch returned no ID. Response:",
        JSON.stringify(userData),
      );
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to fetch user data" }),
      };
    }

    console.log(
      `[exchange-code] ✅ Discord user fetched: ${userData.username} (${userData.id})`,
    );
  } catch (err) {
    console.error(
      "[exchange-code] ❌ Network error fetching user data:",
      (err as Error).message,
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Discord user" }),
    };
  }

  // Step 3: Generate API key
  let apiKey: string;
  try {
    apiKey = `BDTools-${generateApiKey(userData.id as string)}`;
    console.log(
      `[exchange-code] 🔑 API key generated for user: ${userData.id}`,
    );
  } catch (err) {
    console.error(
      "[exchange-code] ❌ Failed to generate API key:",
      (err as Error).message,
    );
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate API key" }),
    };
  }

  console.log("[exchange-code] 🎉 Success — returning user data and API key");
  return {
    statusCode: 200,
    body: JSON.stringify({
      user: {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        discriminator: userData.discriminator || "0",
      },
      apiKey,
    }),
  };
};
