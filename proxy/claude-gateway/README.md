# Claude gateway

The only place the Anthropic API key exists for this project.

Edge Delivery Services serves this repository as static, public, client-side
code. An API key placed anywhere in `blocks/`, `scripts/`, or `head.html` would
be readable by every visitor and usable to bill your account. So the key lives
here instead, in a Cloudflare Worker that is deployed separately and is **not**
served by EDS (`proxy/*` is listed in `.hlxignore`).

```
browser / DA plugin  ──POST──▶  claude-gateway Worker  ──▶  Anthropic API
   (no key)                       (holds the key)
```

## Routes

| Route | Caller | Auth |
|---|---|---|
| `POST /agent/chat` | `blocks/tools/claude-agent` (DA authoring plugin) | requires the DA bearer token |
| `POST /chat` | `blocks/chat` (public site chat block) | open, but origin-restricted |

Request body for both:

```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "repoContext": { "org": "...", "repo": "...", "path": "..." }
}
```

`repoContext` is optional and only used by `/agent/chat`.

Both reply with Server-Sent Events:

```
data: {"type":"delta","text":"partial output"}
data: {"type":"done"}
data: {"type":"error","message":"human readable"}
```

## Deploy

```bash
cd proxy/claude-gateway
npm install
npx wrangler login

# the key — stored encrypted by Cloudflare, never in git
npx wrangler secret put ANTHROPIC_API_KEY

npm run deploy
```

Deploy prints your Worker URL, e.g.
`https://claude-gateway.<your-subdomain>.workers.dev`.

### Then point the clients at it

Both clients read the gateway URL from a meta tag so you don't have to edit JS:

```html
<meta name="claude-gateway" content="https://claude-gateway.<your-subdomain>.workers.dev">
```

- **Site chat block:** add that tag to `head.html`.
- **DA plugin:** the tag is already in `blocks/tools/claude-agent/claude-agent.html`
  — replace the placeholder host there.

### Lock down origins

Edit `ALLOWED_ORIGINS` in `wrangler.toml` to the exact hosts that should be
able to call the gateway, then redeploy. Without this, another site could point
its own chat widget at your Worker and spend your API budget.

## Local development

```bash
npm run dev     # serves the gateway on http://localhost:8787
```

`http://localhost:3000` is already in `ALLOWED_ORIGINS`, so a local
`aem up` site can talk to a local gateway. Point the meta tag at
`http://localhost:8787` while testing.

Use `npm run tail` to stream live logs from the deployed Worker.

## Cost and model notes

- Model: `claude-opus-5`, with adaptive thinking at `effort: "low"` — these are
  short conversational turns, so low effort is both cheaper and fast enough.
- The system prompt is sent with `cache_control: ephemeral`, so repeat requests
  read it from cache at roughly a tenth of the input cost.
- `fallbacks: "default"` is enabled: if a safety classifier declines a request,
  the API re-runs it on a fallback model within the same call rather than
  returning nothing. A declined request that produced no output is not billed.
- Output is capped at 8192 tokens because both surfaces render into small
  panels. Raise `MAX_TOKENS` in `worker.js` if you need longer answers.

## Hardening before real traffic

The gateway validates payload shape, message count, and message length, and
restricts origins. It does **not** yet implement per-visitor rate limiting —
an origin allowlist is not a spend limit, since anyone can forge an `Origin`
header outside a browser. Before exposing `/chat` on a production site, add
either Cloudflare Rate Limiting rules on the Worker route or a
[Durable Object / KV](https://developers.cloudflare.com/workers/) counter keyed
on `CF-Connecting-IP`, and set a monthly spend limit in the Anthropic Console.
