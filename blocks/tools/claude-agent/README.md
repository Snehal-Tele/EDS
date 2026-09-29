# Claude agent — DA plugin

A Document Authoring plugin that lets authors ask Claude for page content and
insert the result into the document they have open.

## Files

| File | Purpose |
|---|---|
| `claude-agent.html` | the plugin page DA loads in an iframe; holds the gateway meta tag |
| `claude-agent.js` | DA SDK wiring, streaming UI, insert/copy controls |
| `tools.js` | gateway transport (SSE over POST) and HTML sanitizing |
| `claude-agent.css` | standalone styles (the plugin runs outside the site's CSS) |

## How to register it

Registration does **not** happen in this repository — there is no repo-side
config file for it. DA discovers plugins through the **apps sheet in your DA
site config**, edited in DA at:

```
https://da.live/config#/Snehal-Tele/EDS/
```

Add a row to the `apps` sheet with these columns:

| Column | Value |
|---|---|
| `title` | `Claude agent` |
| `description` | `Draft page content with Claude` |
| `path` | `https://main--EDS--Snehal-Tele.aem.live/blocks/tools/claude-agent/claude-agent.html` |
| `ref` | `main` |
| `image` | optional icon URL |

Once the row exists, a card appears at
`https://da.live/apps#/Snehal-Tele/EDS`.

DA rewrites the codebase path into an app URL by dropping only the `.html`
extension, so the filename is kept:

```
https://main--EDS--Snehal-Tele.aem.live/blocks/tools/claude-agent/claude-agent.html
                    ↓
https://da.live/app/Snehal-Tele/EDS/blocks/tools/claude-agent/claude-agent
```

That obfuscated URL is expected, not a misconfiguration — and it works
**without** an apps-sheet row, which makes it the quickest way to test.

> **Note on location.** The DA convention is a **root-level `tools/`**
> directory, so the usual path would be `/tools/claude-agent/…`. This project
> keeps the plugin under `blocks/tools/` by choice, so every URL above includes
> the `/blocks/` prefix. If you later move the folder to the repo root, update
> the two `href`/`src` paths in `claude-agent.html` and the `path` column above.
>
> The empty `blocks/tools/library/library.json` is not part of this mechanism.
> DA library *extensions* (block/template/icon pickers) are a separate feature,
> also registered from the site config sheet and pointing at JSON hosted on
> `content.da.live`.

## Prerequisite

The plugin cannot work until the gateway Worker is deployed and its URL is set
in the `<meta name="claude-gateway">` tag in `claude-agent.html`. See
[`proxy/claude-gateway/README.md`](../../../proxy/claude-gateway/README.md).

The `/agent/chat` route requires the DA session token, which the SDK provides
automatically — so this route is not usable from outside an authoring session.

## DA SDK surface used

```js
const { context, token, actions } = await DA_SDK;
```

- `context` — `org`, `repo`, `path` of the page being edited; forwarded to the
  gateway so Claude knows where the author is working
- `token` — sent as `Authorization: Bearer …` to the gateway
- `actions.sendHTML(html)` — insert generated markup into the document
- `actions.sendText(text)` — insert plain text
- `actions.closeLibrary()` — dismiss the palette

There is no `actions.reloadDocument()`; inserting through `sendHTML`/`sendText`
updates the document directly, so no reload is needed.

## Safety

Claude's output is passed through `sanitizeHtml()` before insertion, which
strips `<script>`, `<style>`, `<iframe>`, inline `on*` handlers,
`javascript:` URLs, and `id` attributes. Authored content is durable, so it is
sanitized regardless of what the model was instructed to return.
