---
description: Review a block for EDS performance, accessibility, and convention compliance
argument-hint: <block-name>
---

Review the block `$1` against this project's standards. Read
`blocks/$1/$1.js` and `blocks/$1/$1.scss` (or `.css` if the block has no SCSS
source) before commenting.

Report findings grouped by severity, each with a `file:line` reference. Check:

**Conventions**
- Every CSS selector scoped under `.$1` — flag bare selectors like `.item-list`
- No `.$1-container` / `.$1-wrapper` class names (they collide with sections)
- If a sibling `.scss` exists, the `.css` must not be hand-edited
- `.js` imports include the `.js` extension; airbnb-base clean

**Content contract robustness**
- What happens if the author omits a cell, adds an extra column, or leaves a
  cell empty? Missing-field handling is the most common block bug.
- Does it assume a heading/image/link exists without checking?

**Performance** (target PSI 100)
- No third-party imports or fonts pulled in at block level
- Images use the `<picture>` output from `createOptimizedPicture` where relevant
- No layout-shifting DOM writes after first paint; no forced sync layout in loops
- Nothing that belongs in `delayed.js` running eagerly

**Accessibility** (WCAG 2.1 AA)
- Heading hierarchy preserved from authored content, not hard-coded
- Interactive elements are real `<button>` / `<a>`, keyboard reachable, with
  accessible names; `aria-expanded` etc. kept in sync with state
- Images have alt text; decorative images have empty alt
- Visible focus styles; colour contrast from the token palette

Finish with a short prioritised list of concrete fixes. Do not apply them unless
asked.
