/**
 * Claude gateway for the EDS project.
 *
 * WHY THIS EXISTS: Edge Delivery serves only static, public, client-side code.
 * An Anthropic API key cannot live in that repo — it would be readable by every
 * visitor. This Worker is the only place the key exists. Both clients talk to
 * this Worker; neither ever sees the key.
 *
 * Routes:
 *   POST /agent/chat  authoring assistant, called by the DA plugin
 *                     (blocks/tools/claude-agent) — requires a DA bearer token
 *   POST /chat        visitor assistant, called by the site chat block
 *                     (blocks/chat) — public, rate limited
 *
 * Both stream back Server-Sent Events:
 *   data: {"type":"delta","text":"..."}   incremental output
 *   data: {"type":"done"}                 end of turn
 *   data: {"type":"error","message":"..."} recoverable failure
 *
 * Deploy: see README.md. The key is set with `wrangler secret put ANTHROPIC_API_KEY`
 * and is never committed.
 */
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5';

// Chat answers are read in a small panel, so cap output deliberately rather
// than using the large streaming default.
const MAX_TOKENS = 8192;

const MAX_MESSAGE_CHARS = 8000;
const MAX_HISTORY_MESSAGES = 40;

const AUTHOR_SYSTEM = `You are an authoring assistant embedded in Adobe Document Authoring (DA) for an Adobe Edge Delivery Services site.

You help content authors draft and restructure page content. When you produce content intended for the page, return clean semantic HTML that matches Edge Delivery conventions:
- Sections are separated by <hr>.
- A block is <div class="block-name">, with one <div> per row and one <div> per cell.
- Use real heading levels in order, <p> for copy, <ul>/<ol> for lists, and <a> for links.
- Never include <script>, <style>, inline event handlers, or ids.

Keep prose tight and publication-ready. If a request is ambiguous, state the assumption you made in one sentence, then give the content. Do not describe what you are about to do at length.`;

const VISITOR_SYSTEM = `You are a helpful assistant on a public website. Answer the visitor's question directly and concisely — usually two to four sentences.

Ground rules:
- If you do not know something about this specific organization, its pricing, its inventory, or an individual's account, say so and suggest contacting the site owner. Never invent specifics.
- Never ask for or repeat passwords, payment details, or other sensitive personal data.
- Stay on topics relevant to this website. Politely decline unrelated requests.
- Reply in plain prose. No markdown headings, no code blocks unless asked.`;

/** Requests come from the browser, so every response needs CORS. */
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const origin = request.headers.get('Origin') || '';
  // An explicit allowlist keeps this endpoint from being used to bill your key
  // from someone else's site. Set ALLOWED_ORIGINS in wrangler.toml.
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || '';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

/**
 * Validates and normalizes the client-supplied conversation.
 * Never trust shape, role, or length from the browser.
 * @returns {{messages: object[]}|{error: string}}
 */
function readHistory(payload) {
  const raw = Array.isArray(payload?.messages) ? payload.messages : null;
  if (!raw || raw.length === 0) return { error: 'messages must be a non-empty array' };
  if (raw.length > MAX_HISTORY_MESSAGES) return { error: 'conversation too long' };

  const messages = [];
  for (const entry of raw) {
    const role = entry?.role === 'assistant' ? 'assistant' : 'user';
    const content = typeof entry?.content === 'string' ? entry.content.trim() : '';
    if (!content) return { error: 'every message needs non-empty string content' };
    if (content.length > MAX_MESSAGE_CHARS) return { error: 'message too long' };
    messages.push({ role, content });
  }

  if (messages[0].role !== 'user') return { error: 'conversation must start with a user message' };
  return { messages };
}

/**
 * The DA plugin runs inside an authenticated authoring session, so the
 * authoring route requires the DA token the SDK hands the plugin. This keeps
 * the (more expensive, more capable) authoring prompt off the open internet.
 */
function hasAuthoringCredential(request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') && auth.slice(7).trim().length > 0;
}

function sseResponse(stream, headers) {
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      // no-transform stops intermediary proxies buffering or gzipping the stream
      'cache-control': 'no-cache, no-transform',
      ...headers,
    },
  });
}

async function streamCompletion({ client, systemBlocks, messages }, writable) {
  const encoder = new TextEncoder();
  const writer = writable.getWriter();

  // stream.on('text') fires synchronously and cannot be awaited by the SDK, so
  // chain writes onto a single promise to guarantee frame order and to give
  // the finally block something to await before closing.
  let pending = Promise.resolve();
  const send = (event) => {
    pending = pending.then(() => writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)));
    return pending;
  };

  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Server-side fallback: if a safety classifier declines the request,
      // the API retries it on a fallback model inside the same call instead of
      // returning nothing.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Thinking stays on (the default on Opus 5) but effort is low: these are
      // short conversational turns, not hard reasoning problems.
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low' },
      system: systemBlocks,
      messages,
    });

    stream.on('text', (text) => send({ type: 'delta', text }));

    const final = await stream.finalMessage();

    // A refusal is an HTTP 200 with no usable content — check before trusting it.
    if (final.stop_reason === 'refusal') {
      send({
        type: 'error',
        message: "I can't help with that request.",
      });
    }

    send({ type: 'done' });
  } catch (error) {
    let message = 'The assistant is unavailable right now. Please try again.';
    if (error instanceof Anthropic.RateLimitError) {
      message = "I'm handling a lot of requests right now — please try again in a moment.";
    } else if (error instanceof Anthropic.AuthenticationError) {
      // Misconfigured secret: surface a generic message, log the real cause.
      console.error('ANTHROPIC_API_KEY is missing or invalid', error);
    } else {
      console.error('claude gateway failure', error);
    }
    await send({ type: 'error', message });
    await send({ type: 'done' });
  } finally {
    // flush every queued frame before closing, or the tail of the reply is lost
    await pending.catch(() => {});
    await writer.close();
  }
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405, cors);
    }
    if (!env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured on this Worker');
      return json({ error: 'gateway not configured' }, 500, cors);
    }

    const { pathname } = new URL(request.url);
    const isAuthoring = pathname === '/agent/chat';
    const isVisitor = pathname === '/chat';
    if (!isAuthoring && !isVisitor) {
      return json({ error: 'not found' }, 404, cors);
    }
    if (isAuthoring && !hasAuthoringCredential(request)) {
      return json({ error: 'authoring route requires a DA session token' }, 401, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'body must be JSON' }, 400, cors);
    }

    const history = readHistory(payload);
    if (history.error) {
      return json({ error: history.error }, 400, cors);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    // Stable text first and cached; volatile per-page context goes in its own
    // block AFTER the breakpoint so it can never invalidate the cached prefix.
    const systemBlocks = [{
      type: 'text',
      text: isAuthoring ? AUTHOR_SYSTEM : VISITOR_SYSTEM,
      cache_control: { type: 'ephemeral' },
    }];

    if (isAuthoring && payload.repoContext) {
      const { org, repo, path } = payload.repoContext;
      const where = [org, repo, path].filter(Boolean).join(' / ');
      if (where) {
        systemBlocks.push({ type: 'text', text: `The author is editing ${where}.` });
      }
    }

    const { readable, writable } = new TransformStream();
    // Keep the Worker alive until the Anthropic stream finishes writing.
    ctx.waitUntil(streamCompletion({ client, systemBlocks, messages: history.messages }, writable));

    return sseResponse(readable, cors);
  },
};
