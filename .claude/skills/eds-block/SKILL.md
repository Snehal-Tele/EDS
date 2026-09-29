---
name: eds-block
description: Conventions for writing, editing, and styling blocks in this AEM Edge Delivery Services project — the SCSS/gulp build, the design-token layer, block naming and scoping rules, content-contract robustness, and the three-phase page load. Use whenever creating or modifying anything under blocks/, styles/, or scripts/.
---

# EDS blocks in this project

This repo is an aem-boilerplate project with one significant deviation from
stock boilerplate: **most block CSS is compiled from SCSS.** Get that wrong and
your edits get silently overwritten.

## The SCSS build (project-specific)

- `gulpfile.js` compiles `blocks/**/[^_]*.scss` to a `.css` + `.css.map` sitting
  next to the source. Partials (`_name.scss`) produce no output of their own.
- **If a block has a `.scss`, edit only the `.scss`.** The `.css` is a build
  artifact and is regenerated over your changes.
- **10 blocks have no SCSS** — `col`, `columns`, `footer`, `fragment`, `header`,
  `header-v4`, `headerv2`, `hero`, `media`, `widget`. For those, the `.css` *is*
  the source; edit it directly.
- Compile one file: `npx sass blocks/x/x.scss blocks/x/x.css --style=expanded`
- Compile everything: `npm run build:css`
- Watch + browser-sync: `npm run watch:css`

The `.css` files are committed, so a rebuild can produce large incidental diffs
when the checked-in output is stale. Only commit the CSS for blocks you touched.

## Design tokens

`styles/_tokens.scss` holds pure SCSS variables; `styles/styles.scss` maps them
to `:root` custom properties. Blocks consume the **custom properties**:

```scss
@use '../../styles/tokens' as *;   // gives you $bp-md, $space-m, $container-width-md …

.my-block {
  font-size: var(--body-font-size-s);   // not 19px
  color: var(--color-black);
  padding: var(--space-m);

  @media (width >= $bp-md) { … }        // breakpoints are SCSS vars
}
```

Sizes are responsive at the custom-property level — `--body-font-size-s` already
shrinks on desktop, so don't re-declare it per breakpoint.

Breakpoints: `$bp-sm` 768px, `$bp-md` 1024px, `$bp-lg` 1392px, `$bp-xl` 1500px.
Spacing: `$space-3xs` 4px through `$space-3xl` 96px.

## Naming and scoping

- Block name is kebab-case and matches its directory and both filenames.
- **Every selector must be scoped to the block**: `.my-block .item-list`, never
  `.item-list`.
- Never use `.{blockname}-container` or `.{blockname}-wrapper` — the aem.js
  section decoration already generates those and it gets confusing fast.
- This project uses a BEM-ish inner convention (`.table-v2__table`,
  `.table-v2__cell--label`). Match the block you're editing.
- Variations are plain classes on the block element, authored as
  `blockname (variation)` in the CMS, read with
  `block.classList.contains('variation')`. See `blocks/table-v2/` for the
  pattern (`no-header`, `striped`, `bordered`).

## The block JS contract

```js
/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. load dependencies  2. read config  3. transform DOM  4. add listeners
}
```

- ES6+, no transpiling, no build step, no dependencies. Imports need the `.js`
  extension (enforced by eslint).
- Decide the **content contract** — the rows/cells an author creates — before
  writing code, and handle deviation: authors omit cells, add columns, and leave
  cells empty. Guard every `children[n]` access.
- Inspect real markup before assuming a structure:
  `curl http://localhost:3000/path.plain.html`
- Build DOM with `document.createElement`; only use `innerHTML` to move
  author-provided markup across (as the existing blocks do).

## Performance and loading phases

`scripts/scripts.js` drives eager → lazy → delayed. Blocks in the first section
load eagerly and gate LCP, so keep them lean. Anything deferrable belongs in
`styles/lazy-styles.css` or `scripts/delayed.js`. Target a PageSpeed score of
100. Never modify `scripts/aem.js`.

## Before you're done

1. `npm run lint` (eslint airbnb-base + stylelint standard)
2. Recompile the SCSS you touched
3. View it: `http://localhost:3000/<path>` — dev server is
   `npx -y @adobe/aem-cli up --no-open --forward-browser-logs`, and static test
   content in `drafts/` needs `--html-folder drafts`
