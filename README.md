# BDTools

> Browser-based utilities for the [Bot Designer for Discord](https://botdesignerdiscord.com) community no installs, no accounts required for most tools.

**[bdtools.netlify.app](https://bdtools.netlify.app)** · [Report a Bug](https://bdtools.netlify.app/contact) · [Request a Feature](https://bdtools.netlify.app/contact)

---

## Tools

| Tool | Description |
|------|-------------|
| [Embed Builder](https://bdtools.netlify.app/embed-builder) | Visually build Discord embeds with buttons, select menus, and modals. Outputs ready-to-use embed code. |
| [Send Embed Builder](https://bdtools.netlify.app/send-embed-builder) | Build `$sendEmbedMessage[]` blocks with a live preview. |
| [Code Highlighter](https://bdtools.netlify.app/highlighter) | Custom syntax highlighting for BDFD scripts. Supports 300+ functions with per-function color and style controls. |
| [Code Indenter](https://bdtools.netlify.app/indenter) | Auto-format and indent messy BDFD scripts for readability. |
| [Character Escaper](https://bdtools.netlify.app/escaper) | Escape BDFD special characters: `$`, `;`, `\`, `]`. |
| [Permission Calculator](https://bdtools.netlify.app/permission-calc) | Calculate Discord permission bitfields for bot invites. |
| [Bot Guild List](https://bdtools.netlify.app/bot-guild-list) | API-authenticated dashboard to browse your bot's servers with member counts, icons, and invite links. |

---

## API

BDTools exposes a small serverless API for bot integrations, primarily for the Bot Guild List feature.

**Base URL:** `https://api-bdtools.netlify.app/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get-servers` | `GET` | Retrieve the guild list associated with an API key |
| `/submit-servers` | `POST` | Submit and queue a bot's server list for processing |
| `/bdfd-functions` | `GET` | Proxy for the BDFD public function list API |

Authentication uses JWT-based API keys generated via Discord OAuth. Full docs at [bdtools.netlify.app/api](https://bdtools.netlify.app/api).

```bash
# Example — fetch BDFD function list
curl https://api-bdtools.netlify.app/bdfd-functions
```

---

## Stack

- **Frontend** — Vanilla JS, Tailwind CSS, Geist font
- **Backend** — Netlify Functions (Node.js), MongoDB
- **Auth** — Discord OAuth2, JWT
- **Deployment** — Netlify (continuous deployment from GitHub)


---

## License

All rights reserved. This repository is public for reference only — you may not copy, modify, or redistribute any part of this codebase without explicit permission.

---

## Credits

Built and maintained by [Zubariel](https://zubariel.is-a.dev).  
Thanks to Catearo (BDFD examples) and Luka (testing and bug reports).

Not officially affiliated with Bot Designer for Discord.