// eslint-disable-next-line import/no-unresolved -- DA serves the SDK at runtime
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import streamReply, { gatewayUrl } from '../../../scripts/claude-stream.js';
import { sanitizeHtml, looksLikeHtml } from './tools.js';

/**
 * Claude agent — a Document Authoring plugin.
 *
 * Authors describe the content they want; Claude streams back a draft, which
 * can then be inserted into the open document via the DA SDK.
 *
 * The API key is never here. Requests go to the gateway Worker in
 * proxy/claude-gateway, which holds the key server-side.
 */
(async function init() {
  const { context, token, actions } = await DA_SDK;

  const log = document.getElementById('chat-log');
  const form = document.getElementById('composer');
  const input = document.getElementById('prompt-input');
  const sendBtn = document.getElementById('send-btn');
  const closeBtn = document.getElementById('close-btn');

  /** full conversation, replayed to the gateway on every turn */
  const history = [];
  let busy = false;

  /**
   * Appends a turn to the log and returns its text node holder so streaming
   * deltas can be written into it.
   * @returns {HTMLElement} the element receiving the message body
   */
  function appendToLog(role, text = '') {
    const entry = document.createElement('article');
    entry.className = `agent__turn agent__turn--${role}`;

    const who = document.createElement('p');
    who.className = 'agent__who';
    who.textContent = role === 'user' ? 'You' : 'Claude';

    const body = document.createElement('div');
    body.className = 'agent__text';
    body.textContent = text;

    entry.append(who, body);
    log.append(entry);
    log.scrollTop = log.scrollHeight;
    return body;
  }

  /** Offers the finished reply for insertion into the open document. */
  function addInsertControls(entry, replyText) {
    const bar = document.createElement('div');
    bar.className = 'agent__insert';

    const insert = document.createElement('button');
    insert.type = 'button';
    insert.className = 'agent__insert-btn';
    insert.textContent = looksLikeHtml(replyText) ? 'Insert as content' : 'Insert as text';

    insert.addEventListener('click', () => {
      if (looksLikeHtml(replyText)) {
        actions.sendHTML(sanitizeHtml(replyText));
      } else {
        actions.sendText(replyText);
      }
      insert.textContent = 'Inserted';
      insert.disabled = true;
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'agent__copy-btn';
    copy.textContent = 'Copy';
    copy.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(replyText);
      copy.textContent = 'Copied';
    });

    bar.append(insert, copy);
    entry.append(bar);
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
    sendBtn.textContent = state ? 'Thinking…' : 'Send';
    input.readOnly = state;
  }

  async function send(text) {
    history.push({ role: 'user', content: text });
    appendToLog('user', text);

    const body = appendToLog('assistant');
    body.classList.add('is-streaming');

    let reply = '';
    setBusy(true);

    try {
      await streamReply({
        url: gatewayUrl('/agent/chat'),
        messages: history,
        token,
        repoContext: { org: context.org, repo: context.repo, path: context.path },
      }, (event) => {
        if (event.type === 'delta') {
          reply += event.text;
          body.textContent = reply;
          log.scrollTop = log.scrollHeight;
        } else if (event.type === 'error') {
          body.classList.add('is-error');
          body.textContent = event.message;
        }
      });
    } catch (error) {
      body.classList.add('is-error');
      body.textContent = error.message;
    } finally {
      body.classList.remove('is-streaming');
      setBusy(false);
      input.focus();
    }

    if (reply.trim()) {
      history.push({ role: 'assistant', content: reply });
      addInsertControls(body.parentElement, reply);
    } else {
      // nothing usable came back — don't poison the next turn's history
      history.pop();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = '';
    send(text);
  });

  // Enter sends, Shift+Enter makes a new line — the convention authors expect.
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  closeBtn.addEventListener('click', () => actions.closeLibrary());

  input.focus();
}());
