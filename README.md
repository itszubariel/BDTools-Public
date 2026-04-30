# BDTools

> Browser-based utilities for the [Bot Designer for Discord](https://botdesignerdiscord.com) community: no installs, no accounts required for most tools.

**[bdtools.netlify.app](https://bdtools.netlify.app)** · [Report a Bug](https://bdtools.netlify.app/contact) · [Request a Feature](https://bdtools.netlify.app/contact)

---

## Tools

| Tool | Description |
|------|-------------|
| [Embed Builder](https://bdtools.netlify.app/embed-builder) | Visually build Discord embeds with buttons, select menus, and modals. Outputs ready-to-use embed code. |
| [Send Embed Builder](https://bdtools.netlify.app/send-embed-builder) | Build `$sendEmbedMessage[]` blocks with a live preview. |
| [CompV2 Builder](https://bdtools.netlify.app/container-builder) | Build Discord Component V2 layouts visually and generate your BDFD code. |
| [Code Highlighter](https://bdtools.netlify.app/highlighter) | Custom syntax highlighting for BDFD scripts. Supports 300+ functions with per-function color and style controls. |
| [Code Indenter](https://bdtools.netlify.app/indenter) | Auto-format and indent messy BDFD scripts for readability. |
| [Character Escaper](https://bdtools.netlify.app/escaper) | Escape BDFD special characters: `$`, `;`, `\`, `]`. |
| [Permission Calculator](https://bdtools.netlify.app/permission-calc) | Calculate Discord permission bitfields for bot invites. |
| [Bot Guild List](https://bdtools.netlify.app/bot-guild-list) | API-authenticated dashboard to browse your bot's servers with member counts, icons, and invite links. |
| [Bot Guild List](https://bdtools.netlify.app/bot-guild-list) | already there ✓ |

---

## API

BDTools exposes a serverless API for bot integrations and BDFD tooling.

**Base URL:** `https://api-bdtools.netlify.app/`

### Guild List

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/submit-server` | `POST` | Submit your bot's server list for enrichment. Rate limited to once per 5 hours. |
| `/get-servers` | `GET` | Retrieve your enriched guild list. Cached per user, invalidated on new submission. |

### Node Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/node-status` | `GET` | Full BDFD infrastructure snapshot, all nodes, bot counts, ping, status |
| `/node-status/nodes` | `GET` | All standard nodes only |
| `/node-status/node/:id` | `GET` | Single standard node by ID |
| `/node-status/high-performance` | `GET` | All high-performance nodes |
| `/node-status/history` | `GET` | Time-series snapshots for the last 7 days (5-min intervals) |

### BDFD & Games

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bdfd-functions` | `GET` | Proxy for the BDFD public function list. Cached for 1 hour. |
| `/random-word` | `GET` | Random 5-letter word for Wordle-style games. Rate limited: 30 req/10s. |
| `/validate-word` | `GET` | Validate a 5-letter word against wordlist + dictionary. Rate limited: 60 req/10s. |

Authentication uses JWT-based API keys generated via Discord OAuth. Guild list endpoints require auth. Node status, BDFD, and game endpoints are public.

Full API documentation at [bdtools.netlify.app/docs](https://bdtools.netlify.app/docs).

```bash
# Example — fetch node status
curl https://api-bdtools.netlify.app/node-status

# Example — fetch BDFD function list  
curl https://api-bdtools.netlify.app/bdfd-functions
```

---

## Stack

- **Frontend** — Vanilla JS, Tailwind CSS, Geist font
- **Backend** — Netlify Functions (Node.js), MongoDB
- **Auth** — Discord OAuth2, JWT
- **Deployment** — Netlify (continuous deployment from GitHub)
- **Cron** — cron-job.org (triggers node status scraper every 5 minutes)
- **Cache** — Upstash Redis (rate limiting + guild list caching)

---

## License

All rights reserved. This repository is public for reference only, you may not copy, modify, or redistribute any part of this codebase without explicit permission.

---

## Credits

Built and maintained by [Zubariel](https://zubariel.is-a.dev).  
Thanks to Catearo (BDFD examples), Luka (testing and bug reports), and skraba (testing and feedback for the CompV2 Builder).

Not officially affiliated with Bot Designer for Discord.
