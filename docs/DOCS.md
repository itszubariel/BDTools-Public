# BDTools API Documentation

Base URL: `https://api.bdtools.xyz`

---

## Node Status Endpoints

All node status endpoints are **public** (no authentication required) and updated **every 5 minutes** via scheduled scraper.

### GET /node-status

Returns a full status overview including summary counts and all nodes grouped into standard, high-performance, and offline arrays. This is the primary endpoint for a complete snapshot of the BDFD infrastructure.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Query Parameters:** None

**Success Response (200):**
```json
{
  "totalBots": 812,
  "onlineNodes": 12,
  "offlineNodes": 1,
  "standardNodeCount": 13,
  "hpNodeCount": 1,
  "updatedAt": "2026-04-30T12:00:00.000Z",
  "nodes": {
    "standard": [
      {
        "nodeId": 1,
        "bots": 14,
        "pingMs": 2,
        "status": "online"
      }
    ],
    "highPerformance": [
      {
        "nodeId": 1,
        "bots": 2,
        "pingMs": 1,
        "status": "online"
      }
    ],
    "offline": [
      {
        "nodeId": 7,
        "bots": 0,
        "pingMs": null,
        "status": "offline"
      }
    ]
  }
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /node-status/summary

Alias for `/node-status`. Returns the identical full response with summary counts and all node arrays. Useful when you want a semantically explicit URL.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Query Parameters:** None

**Responses:** Same shape as GET /node-status

**Success Response (200):**
```json
{
  "totalBots": 812,
  "onlineNodes": 12,
  "offlineNodes": 1,
  "standardNodeCount": 13,
  "hpNodeCount": 1,
  "updatedAt": "2026-04-30T12:00:00.000Z",
  "nodes": {
    "standard": [],
    "highPerformance": [],
    "offline": []
  }
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /node-status/nodes

Returns a flat array of all standard nodes sorted by node ID. Use this when you only need the standard node pool without summary metadata or high-performance nodes.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "nodeId": 1,
    "bots": 14,
    "pingMs": 2,
    "status": "online"
  },
  {
    "nodeId": 2,
    "bots": 13,
    "pingMs": 1,
    "status": "online"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /node-status/node/:id

Returns the current status of a single standard node by its numeric ID. Replace `:id` with the node number, e.g. `/node-status/node/5`.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Path Parameters:**
- `id` (integer, required) - The numeric ID of the standard node to retrieve

**Success Response (200):**
```json
{
  "nodeId": 5,
  "bots": 12,
  "pingMs": 1,
  "status": "online"
}
```

**Error Response (404):**
```json
{
  "error": "Node not found"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /node-status/high-performance

Returns a flat array of all high-performance (HP) nodes sorted by node ID. HP nodes typically serve premium bots and have lower ping and higher capacity than standard nodes.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "nodeId": 1,
    "bots": 15,
    "pingMs": 1,
    "status": "online"
  },
  {
    "nodeId": 2,
    "bots": 12,
    "pingMs": 1,
    "status": "online"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /node-status/history

Returns an array of historical status snapshots in chronological order (oldest first). Each snapshot is recorded every 5 minutes and retained for 7 days. Use the `limit` query parameter to control how many records are returned. Ideal for building uptime graphs or trend charts.

**Auth Required:** No  
**Updated:** Every 5 minutes

**Query Parameters:**
- `limit` (integer, optional) - Number of snapshots to return. Default: 2016, Maximum: 2016 (7 days at 5-min intervals). Use 288 for the last 24 hours.

**Success Response (200):**
```json
[
  {
    "totalBots": 818,
    "onlineNodes": 13,
    "offlineNodes": 0,
    "standardNodeCount": 13,
    "hpNodeCount": 1,
    "createdAt": "2026-04-30T11:55:00.000Z"
  },
  {
    "totalBots": 812,
    "onlineNodes": 12,
    "offlineNodes": 1,
    "standardNodeCount": 13,
    "hpNodeCount": 1,
    "createdAt": "2026-04-30T12:00:00.000Z"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Guild List Endpoints

All guild list endpoints **require authentication** via JWT Bearer token with the `BDTools-` prefix.

**Authentication Format:**
```
Authorization: Bearer BDTools-YOUR_API_KEY_HERE
```

### Rate Limits & Restrictions
- **POST /submit-server** is rate limited to **once per 5 hours** per API key.
- **GET /get-servers** is only accessible from **bdtools.xyz** origin (specifically the Bot Guild List page at https://bdtools.xyz/bot-guild-list).
- Retrieved data is **cached in Redis** and invalidates on new submission.

---

### POST /submit-server

Submit your bot's guild list to BDTools. The request body must be plain text with a specific format. Processing happens asynchronously and may take 15 seconds to 5 minutes depending on server count and Discord API response times.

**Auth Required:** Yes  
**Rate Limit:** Once per 5 hours

**Request Body Format (plain text):**

The body must be **plain text** (not JSON) with the following format. Each server requires exactly 4 lines in order:

```
Author ID: 123456789012345678
Server Name: My Awesome Server
Server ID: 987654321098765432
Invite Link: https://discord.gg/abc123
Owner ID: 111222333444555666
Server Name: Another Cool Server
Server ID: 555666777888999000
Invite Link: https://discord.gg/xyz789
Owner ID: 999888777666555444
```

**Important:** The `Author ID` in the body must match the Discord user ID associated with your API key, or the request will be rejected with a 403 error.

**Success Response (202 Accepted):**
```json
{
  "message": "Processing started. This may take anywhere from 15 seconds to 5 minutes depending on the number of servers and Discord's response time.",
  "receivedServers": 42,
  "info": "Once processing is complete, you can view the updated guild list at https://bdtools.xyz/bot-guild-list"
}
```

**Error Response (400) - Empty Body:**
```json
{
  "error": "Request body is empty."
}
```

**Error Response (400) - Missing Author ID:**
```json
{
  "error": "The first line must be \"Author ID: <id>\"."
}
```

**Error Response (400) - Empty Author ID:**
```json
{
  "error": "Author ID value is empty."
}
```

**Error Response (400) - No Servers:**
```json
{
  "error": "No server entries found after Author ID."
}
```

**Error Response (400) - Invalid Format:**
```json
{
  "error": "Invalid body format. Found 7 server lines — must be a multiple of 4 (Server Name, Server ID, Invite Link, Owner ID per server)."
}
```

**Error Response (400) - Wrong Field Order:**
```json
{
  "error": "Line 3: Expected \"Server ID:\", got \"Invite Link: ...\""
}
```

**Error Response (400) - Empty Field:**
```json
{
  "error": "Server entry at index 2 has one or more empty fields."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid or missing API key."
}
```

**Error Response (403) - Author ID Mismatch:**
```json
{
  "error": "Author ID does not match API key."
}
```

**Error Response (405):**
```json
{
  "error": "Method not allowed. Use POST."
}
```

**Error Response (429):**
```json
{
  "error": "You can only submit once every 5 hours.",
  "nextAllowed": "2026-04-30T17:00:00.000Z"
}
```

**Error Response (500) - Database Connection:**
```json
{
  "error": "Database connection failed."
}
```

**Error Response (500) - Processing:**
```json
{
  "error": "Internal server error."
}
```

#### Example BDFD Command

You can use this BDFD command to automatically submit your bot's guild list. Full credit for the example code goes to **Catearo**.

**Note:** You must change `NUMBER_OF_SERVERS` and `YOUR_API_KEY_HERE` placeholders.

```
$nomention
$c[You have to change these two placeholder values]
$var[count;NUMBER_OF_SERVERS]
$httpAddHeader[Authorization;Bearer YOUR_API_KEY_HERE]

$c[DO NOT CHANGE ANYTHING FROM THIS POINT ONWARDS]
$var[i;1]
$textSplit[$serverNames[$var[count];%%%];%%%]
$httpPost[https://api.bdtools.xyz/submit-server;
Author ID: $authorID
$eval[$replaceText[$cropText[$repeatMessage[10;$repeatMessage[10;$repeatMessage[5;a]]];$min[$getTextSplitLength;250]];a;Server Name: %{DOL}%splitText[%{DOL}%var[i\]\]
Server ID: %{DOL}%guildID[%{DOL}%splitText[%{DOL}%var[i\]\]\]
Invite Link: %{DOL}%try %{DOL}%getServerInvite[%{DOL}%guildID[%{DOL}%splitText[%{DOL}%var[i\]\]\]\] %{DOL}%catch failed %{DOL}%endtry
Owner ID: %{DOL}%serverOwner[%{DOL}%guildID[%{DOL}%splitText[%{DOL}%var[i\]\]\]\] %{DOL}%var[i\;%{DOL}%sum[1\;%{DOL}%var[i\]\]\]
]]
]
$c[You can edit this message below:]
$httpResult
```

---

### GET /get-servers

Retrieve the stored guild list for your bot. This endpoint is restricted to requests originating from `bdtools.xyz` (specifically the Bot Guild List page at https://bdtools.xyz/bot-guild-list) and returns cached data from Redis. The cache is automatically invalidated when you submit a new guild list.

**Auth Required:** Yes  
**Cached:** Redis (invalidated on new submission)  
**Origin Restriction:** Only accessible from https://bdtools.xyz/bot-guild-list

**Query Parameters:** None

**Success Response (200):**
```json
{
  "authorId": "123456789012345678",
  "servers": [
    {
      "name": "My Awesome Server",
      "id": "987654321098765432",
      "invite": "https://discord.gg/abc123",
      "ownerId": "111222333444555666",
      "memberCount": 1523,
      "icon": "https://cdn.discordapp.com/icons/987654321098765432/a_1234567890abcdef.png",
      "banner": "https://cdn.discordapp.com/banners/987654321098765432/fedcba0987654321.png",
      "description": "A community for awesome people",
      "features": ["COMMUNITY", "VERIFIED", "PARTNERED"],
      "vanityUrlCode": "awesome"
    },
    {
      "name": "Another Cool Server",
      "id": "555666777888999000",
      "invite": "https://discord.gg/xyz789",
      "ownerId": "999888777666555444",
      "memberCount": 842,
      "icon": "https://cdn.discordapp.com/icons/555666777888999000/b_abcdef1234567890.png",
      "banner": null,
      "description": null,
      "features": [],
      "vanityUrlCode": null
    }
  ]
}
```

**Enriched Data:** The response includes additional fields (`memberCount`, `icon`, `banner`, `description`, `features`, `vanityUrlCode`) that are fetched asynchronously from Discord after submission. These fields may be `null` if enrichment hasn't completed yet or if the data is unavailable.

**Error Response (401):**
```json
{
  "error": "Invalid or missing API key."
}
```

**Error Response (403) - Invalid Origin:**
```json
{
  "error": "Access denied: Invalid origin."
}
```

**Error Response (404):**
```json
{
  "error": "No servers found for this API key."
}
```

**Error Response (405):**
```json
{
  "error": "Method not allowed. Use GET."
}
```

**Error Response (500) - Database Connection:**
```json
{
  "error": "Database connection failed."
}
```

**Error Response (500) - Query:**
```json
{
  "error": "Internal server error."
}
```

---

## BDFD Function Endpoints

### GET /bdfd-functions

Returns the complete list of BDFD functions from the official Bot Designer for Discord API. The response is cached for 1 hour to reduce load on the upstream API. Each function object includes the function name, a description of what it does, and usage examples.

**Auth Required:** No  
**Cached:** 1 hour

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "name": "$username",
    "description": "Returns the username of a user",
    "usage": "$username or $username[userID]"
  },
  {
    "name": "$serverName",
    "description": "Returns the name of the server",
    "usage": "$serverName or $serverName[guildID]"
  },
  {
    "name": "$randomText",
    "description": "Returns a random text from the given options",
    "usage": "$randomText[option1;option2;option3;...]"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch BDFD function list"
}
```

**Error Response (502):**
```json
{
  "error": "BDFD API error: 503"
}
```

---

## Word Game Endpoints

Both word game endpoints are **public** (no authentication required).

### GET /random-word

Returns a random 5-letter word from a curated wordlist. Perfect for starting a new Wordle game. The wordlist contains common English words suitable for word-guessing games.

**Auth Required:** No  
**Rate Limit:** 30 requests per 10 seconds

**Query Parameters:** None

**Success Response (200):**
```json
{
  "word": "apple"
}
```

**Error Response (500) - Empty Wordlist:**
```json
{
  "error": "Word list is empty"
}
```

**Error Response (500) - File Read:**
```json
{
  "error": "Failed to load word list",
  "details": "ENOENT: no such file or directory"
}
```

---

### GET /validate-word

Validates whether a 5-letter word is a valid English word. First checks the curated wordlist, then falls back to an external dictionary. Returns the validation result and the source of validation (wordlist or dictionary).

**Auth Required:** No  
**Rate Limit:** 60 requests per 10 seconds

**Query Parameters:**
- `word` (string, required) - The 5-letter word to validate. Must contain only letters (a-z, A-Z).

**Example:** `/validate-word?word=apple`

**Success Response (200) - Valid (Wordlist):**
```json
{
  "valid": true,
  "word": "apple",
  "source": "wordlist"
}
```

**Success Response (200) - Valid (Dictionary):**
```json
{
  "valid": true,
  "word": "zebra",
  "source": "dictionary"
}
```

**Success Response (200) - Invalid:**
```json
{
  "valid": false,
  "word": "xyzqw"
}
```

**Error Response (400) - Missing Parameter:**
```json
{
  "error": "Missing ?word= parameter"
}
```

**Error Response (400) - Wrong Length:**
```json
{
  "error": "Word must be exactly 5 letters"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to reach dictionary",
  "details": "Network timeout"
}
```

**Error Response (502):**
```json
{
  "error": "Dictionary error",
  "status": 503
}
```

---

## Notes

### Data Freshness
- Node status updates every **5 minutes** via scheduled scraper
- Guild list data cached until new submission

### Authentication
JWT tokens for guild list endpoints should be prefixed with `BDTools-` in the Authorization header:
```
Authorization: Bearer BDTools-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Guild List endpoints require auth. Node Status, BDFD Functions, and Word Games endpoints are public and do not require authentication.

### Rate Limits
- `/submit-server`: Once every 5 hours per API key
- `/random-word`: 30 requests per 10 seconds
- `/validate-word`: 60 requests per 10 seconds
- Other endpoints: No rate limits

### Caching
- `/bdfd-functions`: Cached for 1 hour
- `/get-servers`: Cached in Redis per user, invalidated on new submission
- Node status endpoints: Updated every 5 minutes
- Other endpoints: No caching

### Origin Restrictions
- `/get-servers`: Only accessible from https://bdtools.xyz/bot-guild-list
- Other endpoints: No origin restrictions
