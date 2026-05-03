# BDTools

> Browser-based utilities for the [Bot Designer for Discord](https://botdesignerdiscord.com) community: no installs, no accounts required for most tools.

**[bdtools.xyz](https://bdtools.xyz)** · [Report a Bug](https://bdtools.xyz/contact) · [Request a Feature](https://bdtools.xyz/contact)

---

## Tools

| Tool | Description |
|------|-------------|
| [Embed Builder](https://bdtools.xyz/embed-builder) | Visually build Discord embeds with buttons, select menus, and modals. Outputs ready-to-use embed code. |
| [Send Embed Builder](https://bdtools.xyz/send-embed-builder) | Build `$sendEmbedMessage[]` blocks with a live preview. |
| [CompV2 Builder](https://bdtools.xyz/container-builder) | Build Discord Component V2 layouts visually and generate your BDFD code. |
| [Code Highlighter](https://bdtools.xyz/highlighter) | Custom syntax highlighting for BDFD scripts. Supports 300+ functions with per-function color and style controls. |
| [Code Indenter](https://bdtools.xyz/indenter) | Auto-format and indent messy BDFD scripts for readability. |
| [Character Escaper](https://bdtools.xyz/escaper) | Escape BDFD special characters: `$`, `;`, `\`, `]`. |
| [Permission Calculator](https://bdtools.xyz/permission-calc) | Calculate Discord permission bitfields for bot invites. |
| [Bot Guild List](https://bdtools.xyz/bot-guild-list) | API-authenticated dashboard to browse your bot's servers with member counts, icons, and invite links. |
| [Bot Guild List](https://bdtools.xyz/bot-guild-list) | already there ✓ |

---

## API

BDTools exposes a serverless API for bot integrations and BDFD tooling.

**Base URL:** `https://api.bdtools.xyz/`

### Guild List

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/submit-server` | `POST` | Submit your bot's server list for enrichment. Rate limited to once per 5 hours. |
| `/get-servers` | `GET` | Retrieve your enriched guild list. Cached per user, invalidated on new submission. |

### Node Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/node-status` | `GET` | Full BDFD infrastructure snapshot, all nodes, bot counts, ping, status |
| `/node-status/summary` | `GET` | Alias for `/node-status` with explicit naming |
| `/node-status/nodes` | `GET` | All standard nodes only |
| `/node-status/node/:id` | `GET` | Single standard node by ID |
| `/node-status/high-performance` | `GET` | All high-performance nodes |
| `/node-status/offline` | `GET` | All currently offline nodes (standard + HP) |
| `/node-status/history` | `GET` | Time-series snapshots for the last 7 days. Supports `?limit=24h` or `?graph=true` for PNG charts |
| `/images/:id.png` | `GET` | Dynamically generated PNG charts for node status history |

### BDScript Checker

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bdscript-checker` | `POST` | Comprehensive BDScript/BDFD code validator. Catches syntax errors, validates arguments, checks parent-child relationships, and enforces Components v2 rules. Returns detailed error messages with line numbers. |

### Other Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/random-word` | `GET` | Random 5-letter word for Wordle-style games. Rate limited: 30 req/10s. |
| `/validate-word` | `GET` | Validate a 5-letter word against wordlist + dictionary. Rate limited: 60 req/10s. |
| `/random-pokemon` | `GET` | Random Pokemon from all generations (1-9). Supports `?gen=`, `?name=`, and `?image=true`. Rate limited: 30 req/10s. |

Authentication uses JWT-based API keys generated via Discord OAuth. Guild list and BDScript Checker endpoints require auth. Node status and other utility endpoints are public.

Full API documentation at [bdtools.xyz/docs](https://bdtools.xyz/docs).

```bash
# Example — fetch node status
$httpGet[https://api.bdtools.xyz/node-status]

# Example — fetch offline nodes
$httpGet[https://api.bdtools.xyz/node-status/offline]

# Example — fetch 24h history with graph
$httpGet[https://api.bdtools.xyz/node-status/history?limit=24h&graph=true]

# Example — validate BDScript code
$nomention
$var[code;$message]
$httpAddHeader[Authorization;Bearer BDTools-YOUR_API_KEY_HERE]
$httpPost[https://api.bdtools.xyz/bdscript-checker;
{
  "code": "$var[code]"
}
]
$httpResult

# Example — fetch random Pokemon from Gen 1
$httpGet[https://api.bdtools.xyz/random-pokemon?gen=1]
```

---

## Stack

- **Frontend** — Vanilla JS, Tailwind CSS, Geist font
- **Backend** — Netlify Functions (Node.js), MongoDB
- **Auth** — Discord OAuth2, JWT
- **Deployment** — Netlify (continuous deployment from GitHub)
- **Cron** — cron-job.org (triggers node status scraper every 2 minutes)
- **Cache** — Upstash Redis (rate limiting + guild list caching)

---

## License

All rights reserved. This repository is public for reference only, you may not copy, modify, or redistribute any part of this codebase without explicit permission.

---

## Credits

Built and maintained by [Zubariel](https://zubariel.is-a.dev).  
Thanks to Catearo (BDFD examples), Luka (testing and bug reports), and skraba (testing and feedback for the CompV2 Builder).

Not officially affiliated with Bot Designer for Discord.
