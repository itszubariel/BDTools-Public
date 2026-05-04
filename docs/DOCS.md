# BDTools API Documentation

Base URL: `https://api.bdtools.xyz`

---

## Node Status Endpoints

Monitor Bot Designer for Discord's infrastructure in real-time. All endpoints are **public** (no authentication required) and updated **every 2 minutes** via scheduled scraper.

### GET /node-status

Returns a full status overview including summary counts and all nodes grouped into standard, high-performance, and offline arrays. This is the primary endpoint for a complete snapshot of the BDFD infrastructure.

**Auth Required:** No  
**Updated:** Every 2 minutes

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
**Updated:** Every 2 minutes

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
**Updated:** Every 2 minutes

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
**Updated:** Every 2 minutes

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
**Updated:** Every 2 minutes

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

### GET /node-status/offline

Returns a flat array of all currently offline nodes (both standard and high-performance) sorted by node ID. Use this endpoint to quickly identify which nodes are experiencing downtime.

**Auth Required:** No  
**Updated:** Every 2 minutes

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "nodeId": 7,
    "bots": 0,
    "pingMs": null,
    "status": "offline"
  },
  {
    "nodeId": 12,
    "bots": 0,
    "pingMs": null,
    "status": "offline"
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

Returns an array of historical status snapshots in chronological order (oldest first). Each snapshot is recorded every 2 minutes and retained for 7 days. Use the `limit` query parameter to control how many records are returned - supports both numeric values and human-readable time formats like `24h` or `7d`. Ideal for building uptime graphs or trend charts.

Optionally, you can request a PNG graph visualization by adding `?graph=true` to the URL, which returns a dark-themed chart showing total bots online over the requested time period.

**Auth Required:** No  
**Updated:** Every 2 minutes

**Query Parameters:**
- `limit` (integer or string, optional) - Number of snapshots to return, or time range in human-readable format:
  - **Numeric**: `720` (exact number of snapshots)
  - **Days**: `1d`, `7d` (days, e.g., `7d` = 7 days)
  - **Hours**: `12h`, `24h`, `48h` (hours, e.g., `24h` = 24 hours)
  - Default: `5040` (7 days), Maximum: `5040` (7 days at 2-min intervals)
  - Examples: `limit=1d` (1 day), `limit=24h` (24 hours), `limit=720` (720 snapshots)
- `graph` (string, optional) - Set to `true` or `yes` to receive a PNG graph URL alongside the data.

**Success Response (200) - Without Graph:**
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

**Success Response (200) - With Graph (`?graph=true`):**
```json
{
  "data": [
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
  ],
  "png": "https://api.bdtools.xyz/images/limit-720-hash-a1b2c3d4.png"
}
```

**Graph Image Features:**
- Dark-themed chart with purple line graph
- Title automatically adjusts based on time range (e.g., "Total Bots Online - Past 24 Hours" or "Total Bots Online - Past 7 Days")
- Shows total bots online over the requested time period
- Image is cached for 5 minutes
- Can be embedded directly in BDFD:
  ```shell
  $image[https://api.bdtools.xyz/images/limit-720-hash-a1b2c3d4.png]
  ```

**Example Requests:**
- `/node-status/history?limit=24h&graph=true` - Get 24 hours of data with graph
- `/node-status/history?limit=1d&graph=true` - Get 1 day of data with graph (same as 24h)
- `/node-status/history?limit=3d&graph=true` - Get 3 days of data with graph
- `/node-status/history?limit=7d&graph=true` - Get 7 days of data with graph
- `/node-status/history?limit=12h&graph=true` - Get 12 hours of data with graph
- `/node-status/history?limit=720` - Get exactly 720 snapshots (numeric format still works)
**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### GET /images/:id.png

Serves dynamically generated PNG chart images for node status history. This endpoint is typically accessed via URLs returned by the `/node-status/history?graph=true` endpoint. The image ID encodes the query parameters used to generate the chart.

**Auth Required:** No  
**Cached:** 5 minutes

**Path Parameters:**
- `id` (string, required) - Encoded image identifier containing chart parameters (e.g., `limit-720-hash-a1b2c3d4`)

**Chart Features:**
- Dark-themed background (#1f2937)
- Purple line graph showing total bots online
- Smooth curve with gradient fill
- Dynamic title based on time range
- Y-axis shows bot count
- X-axis labels hidden for cleaner appearance
- 1000x400px resolution

**Success Response (200):**
- Content-Type: `image/png`
- Returns a PNG image

**Example Usage:**
```shell
$image[https://api.bdtools.xyz/images/limit-720-hash-a1b2c3d4.png]
```

**Error Response (400) - Invalid ID:**
```json
{
  "error": "Invalid image ID format"
}
```

**Error Response (404) - No Data:**
```json
{
  "error": "No history data available"
}
```

**Error Response (502) - Chart Generation Failed:**
```json
{
  "error": "Failed to generate chart"
}
```

---

## Bot Guild List Endpoints

Submit and retrieve bot server lists. All guild list endpoints **require authentication** via JWT Bearer token with the `BDTools-` prefix.

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

```shell
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

## BDScript Checker

Comprehensive BDScript/BDFD code validator that catches syntax errors and common mistakes before you run your code. Made specially for the `!run` command by BDSuper in the BDFD Support Server.

### POST /bdscript-checker

Validates BDFD code for syntax errors, argument issues, and BDFD requirements. Returns detailed error messages with line numbers to help you fix issues quickly. Function definitions are loaded from a local JSON file for fast validation.

**Auth Required:** Yes  
**Rate Limit:** None

**Request Body:**
```json
{
  "code": "$setUserVar[test;1;2;3;4]"
}
```

**Success Response (200) - With Errors:**
```json
{
  "errors": [
    {
      "function": "$setUserVar",
      "line": 1,
      "message": "$setUserVar - Too many arguments, expected up to 4, got 5"
    }
  ],
  "hasErrors": true,
  "statistics": {
    "functions": 1,
    "arguments": 5,
    "variables": ["points"]
  }
}
```

**Success Response (200) - No Errors:**
```json
{
  "errors": [],
  "hasErrors": false,
  "statistics": {
    "functions": 3,
    "arguments": 5,
    "variables": ["level", "points"]
  }
}
```

**Statistics Object:**
- `functions` - Total number of function calls in the code
- `arguments` - Total number of arguments across all functions
- `variables` - Array of unique variable names used (sorted alphabetically)
  - Includes: `$var[]`, `$getUserVar[]`, `$getServerVar[]`, `$getChannelVar[]`, `$getVar[]`, `$setUserVar[]`, `$setServerVar[]`, `$setChannelVar[]`, `$setVar[]`
  - Extracts only the first argument (variable name)
  - Deduplicates: if same variable is both set and get, appears only once
  - Only includes variables with static names (excludes dynamic variable names like `$getUserVar[$var[x]]`)

---

### Validation Features

The validator performs comprehensive checks to catch errors before your code runs:

#### 1. Unknown Functions
Warns if a function doesn't exist in the BDFD function list.

**Example Error:**
```json
{
  "function": "$unknownFunc",
  "line": 1,
  "message": "$unknownFunc - Unknown function",
  "type": "warning"
}
```

#### 2. Argument Count Validation
Validates minimum and maximum argument counts. Handles functions with multiple signatures (different argument patterns).

**Example Errors:**
```json
{
  "function": "$setUserVar",
  "line": 1,
  "message": "$setUserVar - Expected at least 2 argument(s), got 1"
}
```
```json
{
  "function": "$setUserVar",
  "line": 1,
  "message": "$setUserVar - Too many arguments, expected up to 4, got 5"
}
```

**Argument Counting Rules:**
- No brackets: `$function` = 0 arguments
- Empty brackets: `$function[]` = 1 empty argument
- Semicolons separate arguments: `$function[A;B]` = 2 arguments
- Trailing semicolon counts: `$function[A;]` = 2 arguments (second is empty)

#### 3. Empty Argument Validation
Checks if empty arguments are allowed based on function definition.

**Example Error:**
```json
{
  "function": "$addTextDisplay",
  "line": 1,
  "message": "$addTextDisplay - Argument 2 (Container/Section ID) cannot be empty"
}
```

#### 4. Enum Validation
Validates that enum arguments use valid values from the allowed list.

**Example Error:**
```json
{
  "function": "$addButtonCV2",
  "line": 1,
  "message": "$addButtonCV2 - Expected valid enum value in position 3, got 'invalid'. Valid values: danger, link, primary, secondary, success"
}
```

#### 5. Type Validation
Validates argument types including Number, Boolean, Integer, and Snowflake (Discord IDs).

**Example Errors:**
```json
{
  "function": "$sum",
  "line": 1,
  "message": "$sum - Argument 1 (Number) must be a number, got 'abc'"
}
```
```json
{
  "function": "$deleteMessage",
  "line": 1,
  "message": "$deleteMessage - Argument 1 (Message ID) must be a valid Discord ID (snowflake), got '123'"
}
```

**Type Rules:**
- **Number/Integer:** Must be numeric (e.g., `123`, `-45`, `3.14`)
- **Boolean:** Must be `true`, `false`, `yes`, `no`, `1`, or `0`
- **Snowflake:** Must be 17-19 digit Discord ID

**Special Value:** The BDFD special value `!unchanged` is recognized in `$modifyChannel`, `$modifyRole`, and `$editThread` only and skips type validation. This value indicates "keep the current value unchanged".

#### 6. JSON Syntax Validation
Validates JSON syntax in `$jsonParse` to catch malformed JSON.

**Example Error:**
```json
{
  "function": "$jsonParse",
  "line": 1,
  "message": "$jsonParse - Invalid JSON syntax"
}
```

#### 7. Bracket Matching
Ensures all brackets are properly opened and closed.

**Example Errors:**
```json
{
  "function": "syntax",
  "line": 1,
  "message": "Missing closing bracket ']' - 2 unclosed bracket(s)"
}
```
```json
{
  "function": "syntax",
  "line": 1,
  "message": "Extra closing bracket ']' found without matching opening bracket '['"
}
```

#### 8. Unclosed Blocks
Detects unclosed control flow blocks like `$if`, `$try`, and `$async`.

**Example Error:**
```json
{
  "function": "$if",
  "line": 1,
  "message": "$if opened but never closed with $endif"
}
```

**Block Pairs:**
- `$if` ... `$endif` (note: `$else` is optional)
- `$try` ... `$endtry` (note: `$catch` is optional)
- `$async` ... `$endasync`

#### 9. Multiple $else and $catch Detection
Detects multiple `$else` statements in the same `$if` block, or multiple `$catch` statements in the same `$try` block (only one of each is allowed).

**Example Errors:**
```json
{
  "function": "$else",
  "line": 5,
  "message": "Multiple $else statements in the same $if block (started on line 1). Only one $else is allowed per $if block."
}
```
```json
{
  "function": "$catch",
  "line": 4,
  "message": "Multiple $catch statements in the same $try block (started on line 1). Only one $catch is allowed per $try block."
}
```

#### 10. Context Validation (Parent-Child Relationships)
Ensures context-dependent functions have their required parent functions defined **before** use.

**Modal Components:**
- `$addTextInput` requires `$newModal`

**Select Menus:**
- `$addSelectMenuOption` requires `$newSelectMenu` or `$editSelectMenu`

**Components v2:**
- `$addThumbnail` requires `$addSection`
- `$addMediaGalleryItem` requires `$addMediaGallery`
- `$addButtonCV2` requires `$addActionRow` or `$addSection`
- `$addUserSelect`, `$addRoleSelect`, `$addMentionableSelect`, `$addChannelSelect`, `$addStringSelect` require `$addActionRow`
- `$addStringSelectOption` requires `$addStringSelect`

**Text Splitting:**
- `$splitText`, `$getTextSplitLength`, `$joinSplitText`, etc. require `$textSplit`

**JSON Functions:**
- `$json`, `$jsonUnset`, `$jsonArray`, etc. require `$jsonParse` or `$jsonSet`

**Note:** `$addTextDisplay` and `$addSeparator` can exist without a parent (optional).

**Example Errors:**
```json
{
  "function": "$addTextInput",
  "line": 1,
  "message": "$addTextInput requires $newModal to be called first"
}
```
```json
{
  "function": "$addButtonCV2",
  "line": 5,
  "message": "$addButtonCV2 references action row 'row1' before it is defined — $addActionRow[row1] is on line 10"
}
```

#### 11. Components v2 Validation Rules
Validates BDFD's requirements for Components v2 to catch errors before running code.

**Sections:**
- Must have at least 1 Text Display component
- Must have at least 1 accessory (thumbnail or button)
- Duplicate section IDs are not allowed (each section needs a unique ID)

**Containers:**
- Must have at least 1 child component

**Media Galleries:**
- Must have at least 1 media item

**Action Rows:**
- Cannot mix buttons and select menus
- Maximum 5 buttons per action row
- Maximum 1 select menu per action row

**Parent-Child Order:**
- Parents must be defined before children reference them
- Empty required parent IDs trigger errors

**Example Errors:**
```json
{
  "function": "$addSection",
  "line": 1,
  "message": "Section 'main' needs at least 1 Text Display component — use $addTextDisplay to add content"
}
```
```json
{
  "function": "$addSection",
  "line": 1,
  "message": "Section 'main' needs an accessory (thumbnail or button) — use $addThumbnail or $addButtonCV2"
}
```
```json
{
  "function": "$addActionRow",
  "line": 1,
  "message": "Action Row 'row1' cannot mix buttons and select menus — use separate action rows"
}
```
```json
{
  "function": "$addActionRow",
  "line": 1,
  "message": "Action Row 'row1' has 6 buttons — maximum of 5 buttons per action row"
}
```
```json
{
  "function": "$addButtonCV2",
  "line": 5,
  "message": "$addButtonCV2 requires an action row or section ID in argument 6 — define $addActionRow or $addSection first and provide its ID"
}
```

**Select Menus:**
- `$newSelectMenu` and `$editSelectMenu` must have at least 1 option
- `$addStringSelect` must have at least 1 option
- String select menus must have at least as many options as the max value

**Example Errors:**
```json
{
  "function": "$newSelectMenu",
  "line": 1,
  "message": "Select Menu 'menu1' must have at least 1 option — use $addSelectMenuOption to add options"
}
```
```json
{
  "function": "$addStringSelect",
  "line": 1,
  "message": "String Select Menu 'menu1' has max value of 25 but only 1 option(s) — need at least 25 options"
}
```

#### 12. Negative Number Validation
Validates that functions which don't accept negative numbers receive valid values.

**Functions checked:**
- `$random` - Both min and max must be >= 0
- `$cropText` - Cannot accept negative values
- `$sqrt` - Cannot accept negative values

**Example Errors:**
```json
{
  "function": "$random",
  "line": 1,
  "message": "$random - Argument 1 cannot be negative, got '-5'"
}
```
```json
{
  "function": "$cropText",
  "line": 1,
  "message": "$cropText - Argument 2 cannot be negative, got '-10'"
}
```

#### 13. Min/Max Value Validation
Validates min and max value constraints for select menus.

**$newSelectMenu / $editSelectMenu:**
- Min must be >= 0
- Max must be <= 25
- Min must be < Max (strict inequality)

**CompV2 Select Menus ($addUserSelect, $addRoleSelect, $addChannelSelect, $addMentionableSelect, $addStringSelect):**
- Min must be >= 0
- Max must be <= 25
- Min must be <= Max (can be equal)

**Example Errors:**
```json
{
  "function": "$newSelectMenu",
  "line": 1,
  "message": "$newSelectMenu - Min value cannot be negative, got -1"
}
```
```json
{
  "function": "$addUserSelect",
  "line": 1,
  "message": "$addUserSelect - Max value cannot be greater than 25, got 30"
}
```
```json
{
  "function": "$random",
  "line": 1,
  "message": "$random - Min value (10) must be less than Max value (5)"
}
```
```json
{
  "function": "$addChannelSelect",
  "line": 1,
  "message": "$addChannelSelect - Min value (10) cannot be greater than Max value (5)"
}
```

---

### Variable Bypass System

When arguments contain **variables**, **nested functions**, or the **special value `!unchanged`** (in `$modifyChannel` only), the validator automatically skips certain validations because their values are dynamic, unknown at validation time, or have special meaning.

**Values that trigger bypass:**
- `$var[]`
- `$getUserVar[]`
- `$getServerVar[]`
- `$getChannelVar[]`
- `$getVar[]`
- Any nested function (contains `$`)
- `!unchanged` (BDFD special value in `$modifyChannel`, `$modifyRole`, and `$editThread` only)

**What gets skipped:**
- Enum validation (for variables and nested functions)
- Type validation (for variables, nested functions, and `!unchanged` in `$modifyChannel`)
- JSON syntax validation (for variables and nested functions)
- Parent-child ID validation (for variables and nested functions)

**Examples:**
```bdscript
$addButtonCV2[btn;Click;$getUserVar[style];...;...;$var[rowId]]
```
This will **not** error even if `$getUserVar[style]` returns an invalid enum, because the validator can't know the value at validation time.

```bdscript
$modifyChannel[1234567890123456789;New Name;;;!unchanged;!unchanged]
```
The `!unchanged` values will **not** error for type validation in `$modifyChannel`, `$modifyRole`, or `$editThread` because it's a special BDFD value meaning "keep the current value unchanged".

---

### Escape Sequences

The validator properly handles BDFD escape sequences:

| Escape | Result | Description |
|--------|--------|-------------|
| `$c[]` | `$` | Escaped dollar sign (displays `$` as text) |
| `\;` | `;` | Escaped semicolon (includes `;` in argument) |
| `\]` | `]` | Escaped closing bracket (includes `]` in argument) |
| `\\` | `\` | Escaped backslash (displays `\` as text) |
| `%{DOL}%` | `$` | Alternative dollar escape |
| `%{-SEMICOL-}%` | `;` | Alternative semicolon escape |
| `%ESCAPED%` | `]` | Alternative bracket escape |

---

### Multi-line Code Support

The API automatically handles multi-line code with line breaks. Users can type their code naturally with proper formatting, and the API will parse it correctly.

**Example:**
```bdscript
$if[$authorID==$botOwnerID]
  $sendMessage[Hello owner!]
$else
  $sendMessage[Hello user!]
$endif
```

---

### Error Sorting

Errors are automatically sorted by line number for easier debugging. This helps you fix issues from top to bottom.

---

### Example BDFD Usage

To validate user-provided code, capture it with `$message` and store it in a variable to prevent BDFD from executing it:

```shell
$nomention
$var[code;$message]
$httpAddHeader[Authorization;Bearer BDTools-YOUR_API_KEY_HERE]
$httpPost[https://api.bdtools.xyz/bdscript-checker;
{
  "code": "$var[code]"
}
]
$httpResult
```

**How it works:**
1. User types: `!run $sendMessage[Hello World!]`
2. `$message` captures the raw code after the command
3. Store it in `$var[code]` to prevent execution
4. Send to API for validation
5. Display the result with `$httpResult`

**Important:** Always store the code in a `$var` before using it in JSON. If you use `$message` directly in the JSON, BDFD will execute the code instead of sending it as text.

---

### Error Responses

**Error Response (401) - Unauthorized:**
```json
{
  "error": "Invalid or missing API key."
}
```

**Error Response (400) - Invalid Request:**
```json
{
  "error": "Missing or invalid 'code' field"
}
```

**Error Response (405) - Method Not Allowed:**
```json
{
  "error": "Method not allowed. Use POST."
}
```

**Error Response (500) - Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---
## Other Endpoints

These endpoints are **public** (no authentication required) and provide various utility functions including word games and Pokemon data.

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

### GET /random-pokemon

Returns a random Pokemon name from all generations (1-9, over 1000 Pokemon). Can optionally return the Pokemon sprite image by adding `?image=true`. Images are sourced from PokeAPI's official artwork collection. You can also request a specific Pokemon by name using the `?name=` parameter, or filter by generation using `?gen=`.

**Auth Required:** No  
**Rate Limit:** 30 requests per 10 seconds

**Query Parameters:**
- `gen` (integer, optional) - Filter by generation (1-9). Examples: `?gen=1` for Kanto, `?gen=2` for Johto, etc.
- `image` (string, optional) - Set to `true` to return the Pokemon sprite image instead of JSON
- `name` (string, optional) - Specify a Pokemon name to get that specific Pokemon (e.g., `?name=pikachu`)

**Success Response (200) - Name Only:**
```json
{
  "pokemon": "pikachu"
}
```

**Success Response (200) - With Image (`?image=true`):**
- Content-Type: `image/png`
- Returns the Pokemon sprite image (official artwork from PokeAPI)
- Cached for 24 hours

**Example Usage:**
```shell
<!-- Random Pokemon from all generations -->
$httpGet[https://api.bdtools.xyz/random-pokemon]

<!-- Random Pokemon from Gen 1 (Kanto) -->
$httpGet[https://api.bdtools.xyz/random-pokemon?gen=1]

<!-- Random Pokemon from Gen 2 (Johto) -->
$httpGet[https://api.bdtools.xyz/random-pokemon?gen=2]

<!-- Random Gen 1 Pokemon image -->
$image[https://api.bdtools.xyz/random-pokemon?gen=1&image=true]

<!-- Specific Pokemon name -->
$httpGet[https://api.bdtools.xyz/random-pokemon?name=charizard]

<!-- Specific Pokemon image -->
$image[https://api.bdtools.xyz/random-pokemon?name=pikachu&image=true]
```

**Generations:**
- Gen 1: Kanto (1-151)
- Gen 2: Johto (152-251)
- Gen 3: Hoenn (252-386)
- Gen 4: Sinnoh (387-493)
- Gen 5: Unova (494-649)
- Gen 6: Kalos (650-721)
- Gen 7: Alola (722-809)
- Gen 8: Galar (810-905)
- Gen 9: Paldea (906-1025)

**Error Response (400) - Invalid Generation:**
```json
{
  "error": "Invalid generation. Must be between 1 and 9."
}
```

**Error Response (404) - Pokemon Not Found:**
```json
{
  "error": "Pokemon not found"
}
```

**Error Response (404) - Image Not Found:**
```json
{
  "error": "Pokemon image not found",
  "pokemon": "pikachu"
}
```

**Error Response (500) - Empty List:**
```json
{
  "error": "Pokemon list is empty"
}
```

**Error Response (502) - Image Fetch Failed:**
```json
{
  "error": "Failed to fetch Pokemon image",
  "details": "Network timeout"
}
```

---

## Notes

### Data Freshness
- Node status updates every **2 minutes** via scheduled scraper
- Guild list data cached until new submission

### Authentication
JWT tokens for guild list endpoints should be prefixed with `BDTools-` in the Authorization header:
```
Authorization: Bearer BDTools-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Authentication by endpoint:**
- **Node Status**: No auth required (public)
- **Bot Guild List**: Auth required
- **BDScript Checker**: Auth required
- **Other Endpoints**: No auth required (public)

### Rate Limits
- `/submit-server`: Once every 5 hours per API key
- `/random-word`: 30 requests per 10 seconds
- `/validate-word`: 60 requests per 10 seconds
- `/random-pokemon`: 30 requests per 10 seconds
- Other endpoints: No rate limits

### Caching
- `/bdfd-functions`: Cached for 1 hour
- `/get-servers`: Cached in Redis per user, invalidated on new submission
- `/random-pokemon?image=true`: Cached for 24 hours
- Node status endpoints: Updated every 2 minutes
- Other endpoints: No caching

### Origin Restrictions
- `/get-servers`: Only accessible from https://bdtools.xyz/bot-guild-list
- Other endpoints: No origin restrictions
