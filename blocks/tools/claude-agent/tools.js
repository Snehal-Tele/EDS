/**
 * DA-specific helpers for the Claude agent plugin.
 *
 * The gateway transport lives in scripts/claude-stream.js and is shared with
 * the site chat block; this module holds only what is specific to inserting
 * model output into an authored document.
 */

/**
 * Strips anything that must never enter an authored document.
 * Claude is instructed to return clean semantic HTML, but authored content is
 * durable and shared, so it is sanitized regardless of instructions.
 * @param {string} html untrusted markup
 * @returns {string} markup safe to hand to actions.sendHTML
 */
export function sanitizeHtml(html) {
  const doc = document.implementation.createHTMLDocument('');
  doc.body.innerHTML = html;

  doc.body.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((node) => {
    node.remove();
  });

  doc.body.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach(({ name, value }) => {
      const isEventHandler = name.startsWith('on');
      const isUnsafeUrl = /^(href|src)$/i.test(name) && /^\s*javascript:/i.test(value);
      if (isEventHandler || isUnsafeUrl || name === 'id') node.removeAttribute(name);
    });
  });

  return doc.body.innerHTML.trim();
}

/**
 * True when a reply looks like markup, so it should be inserted with
 * `sendHTML` rather than `sendText`.
 */
export function looksLikeHtml(text) {
  return /<(p|h[1-6]|ul|ol|li|div|table|a|strong|em|hr|img|blockquote)\b/i.test(text);
}
