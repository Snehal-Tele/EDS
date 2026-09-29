/**
 * Client for the Claude gateway Worker (proxy/claude-gateway).
 *
 * Shared by the site chat block (blocks/chat) and the DA authoring plugin
 * (blocks/tools/claude-agent) so the wire protocol is defined in exactly one
 * place. No API key is involved here — the gateway holds it.
 */

/** Resolves the gateway base URL from <meta name="claude-gateway">. */
export function gatewayUrl(route) {
  const meta = document.querySelector('meta[name="claude-gateway"]');
  const base = meta?.content?.trim().replace(/\/$/, '');
  return base ? `${base}${route}` : '';
}

/**
 * Parses whole SSE frames into events, discarding anything malformed.
 * Declared at module scope so no closure is created inside the read loop.
 * @param {string[]} frames complete `data: …` frames
 * @returns {object[]} decoded events
 */
function parseFrames(frames) {
  return frames
    .map((frame) => frame.split('\n').find((part) => part.startsWith('data:')))
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line.slice(5).trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * POSTs a conversation to the gateway and invokes `onEvent` for each streamed
 * event: `{type:'delta', text}`, `{type:'error', message}`, `{type:'done'}`.
 *
 * Uses fetch rather than EventSource because EventSource cannot POST a body or
 * set an Authorization header.
 *
 * @param {object} options
 * @param {string} options.url gateway endpoint
 * @param {object[]} options.messages conversation so far
 * @param {string} [options.token] bearer credential (DA session token)
 * @param {object} [options.repoContext] org/repo/path being edited
 * @param {AbortSignal} [options.signal]
 * @param {(event: object) => void} onEvent
 */
export default async function streamReply({
  url, messages, token, repoContext, signal,
}, onEvent) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, repoContext }),
    signal,
  });

  if (!response.ok || !response.body) {
    let detail = `gateway returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) detail = body.error;
    } catch {
      // non-JSON error body — keep the status-based message
    }
    throw new Error(detail);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';

  for (;;) {
    // Sequential by nature: each chunk must be handled before the next read.
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    buffer += value;
    // A frame ends at a blank line and may straddle chunk boundaries, so keep
    // the trailing partial frame in the buffer.
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    parseFrames(frames).forEach(onEvent);
  }
}
