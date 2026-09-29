/**
 * Chat block — a visitor-facing Claude assistant.
 *
 * Content contract (all rows optional):
 *   | chat |                                          |
 *   | heading      | Ask us anything                   |
 *   | intro        | Answers are AI generated…         |
 *   | placeholder  | Type your question…               |
 *   | greeting     | Hi! What can I help you with?     |
 *
 * Unknown keys are ignored; missing keys fall back to the defaults below, so a
 * bare `| chat |` block renders and works.
 *
 * The Anthropic API key is never in this file. Requests go to the gateway
 * Worker (proxy/claude-gateway), whose URL comes from
 * <meta name="claude-gateway"> in head.html.
 */
import streamReply, { gatewayUrl } from '../../scripts/claude-stream.js';

const DEFAULTS = {
  heading: 'Ask a question',
  intro: '',
  placeholder: 'Type your question…',
  greeting: '',
};

const MAX_CHARS = 2000;

/** Reads the `key | value` rows an author may have provided. */
function readConfig(block) {
  const config = { ...DEFAULTS };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '-');
    const value = cells[1].textContent.trim();
    if (key in config && value) config[key] = value;
  });

  return config;
}

export default async function decorate(block) {
  const config = readConfig(block);
  const endpoint = gatewayUrl('/chat');

  block.innerHTML = '';

  const heading = document.createElement('h2');
  heading.className = 'chat__heading';
  heading.textContent = config.heading;
  block.append(heading);

  if (config.intro) {
    const intro = document.createElement('p');
    intro.className = 'chat__intro';
    intro.textContent = config.intro;
    block.append(intro);
  }

  const log = document.createElement('div');
  log.className = 'chat__log';
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  log.setAttribute('aria-label', 'Conversation');
  block.append(log);

  const form = document.createElement('form');
  form.className = 'chat__composer';

  const label = document.createElement('label');
  label.className = 'chat__label';
  label.textContent = 'Your question';
  const inputId = `chat-input-${Math.random().toString(36).slice(2, 8)}`;
  label.setAttribute('for', inputId);

  const input = document.createElement('textarea');
  input.className = 'chat__input';
  input.id = inputId;
  input.rows = 2;
  input.maxLength = MAX_CHARS;
  input.placeholder = config.placeholder;

  const send = document.createElement('button');
  send.className = 'chat__send';
  send.type = 'submit';
  send.textContent = 'Send';

  form.append(label, input, send);
  block.append(form);

  /** @returns {HTMLElement} the element that receives this turn's text */
  const appendTurn = (role, text = '') => {
    const turn = document.createElement('div');
    turn.className = `chat__turn chat__turn--${role}`;

    const who = document.createElement('span');
    who.className = 'chat__who';
    who.textContent = role === 'user' ? 'You' : 'Assistant';

    const body = document.createElement('p');
    body.className = 'chat__text';
    body.textContent = text;

    turn.append(who, body);
    log.append(turn);
    log.scrollTop = log.scrollHeight;
    return body;
  };

  if (config.greeting) appendTurn('assistant', config.greeting);

  if (!endpoint) {
    // Misconfiguration should be obvious to an author previewing the page,
    // without leaving a dead input for visitors to type into.
    const body = appendTurn('assistant', 'Chat is not configured yet: no <meta name="claude-gateway"> tag was found.');
    body.classList.add('is-error');
    input.disabled = true;
    send.disabled = true;
    return;
  }

  const history = [];
  let busy = false;

  const setBusy = (state) => {
    busy = state;
    send.disabled = state;
    send.textContent = state ? 'Sending…' : 'Send';
  };

  async function ask(question) {
    history.push({ role: 'user', content: question });
    appendTurn('user', question);

    const body = appendTurn('assistant');
    body.classList.add('is-streaming');

    let reply = '';
    setBusy(true);

    try {
      await streamReply({ url: endpoint, messages: history }, (event) => {
        if (event.type === 'delta') {
          reply += event.text;
          body.textContent = reply;
          log.scrollTop = log.scrollHeight;
        } else if (event.type === 'error') {
          body.classList.add('is-error');
          body.textContent = event.message;
        }
      });
    } catch {
      body.classList.add('is-error');
      body.textContent = 'Sorry — I could not reach the assistant. Please try again.';
    } finally {
      body.classList.remove('is-streaming');
      setBusy(false);
    }

    if (reply.trim()) {
      history.push({ role: 'assistant', content: reply });
    } else {
      history.pop();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || busy) return;
    input.value = '';
    ask(question);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}
