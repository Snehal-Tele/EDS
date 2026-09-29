---
description: Scaffold a new EDS block (js + scss + draft test content) following project conventions
argument-hint: <block-name> [one-line description of what it should do]
---

Scaffold a new Edge Delivery Services block named `$1` in this project.

Arguments given: $ARGUMENTS

Follow these steps in order. Do not skip the content-contract step — it is the
author-developer contract and is expensive to change later.

1. **Check the name is free.** `ls blocks/` — if `$1` already exists, stop and
   say so. Block names are kebab-case, no `-container` / `-wrapper` suffixes
   (those collide with section classes).

2. **Decide the content contract first.** State, in one short table, the rows
   and cells an author will create in the CMS and what each maps to. Handle
   missing and extra cells gracefully — authors omit fields.

3. **Create `blocks/$1/$1.scss`.** Start with `@use '../../styles/tokens' as *;`
   and scope every selector under `.$1`. Mobile-first; use `@media (width >= $bp-sm)`
   / `$bp-md` / `$bp-lg` for larger breakpoints. Use the `--*` custom properties
   (`var(--body-font-size-s)`, `var(--color-black)`, `var(--space-m)`) rather
   than raw values. Never write `blocks/$1/$1.css` by hand — it is generated.

4. **Create `blocks/$1/$1.js`** exporting `export default async function decorate(block)`.
   Read the block's existing DOM, transform it, and clear/re-append. Keep it
   dependency-free.

5. **Compile and lint:** `npx sass blocks/$1/$1.scss blocks/$1/$1.css --style=expanded`
   then `npm run lint`.

6. **Create draft test content** at `drafts/$1.plain.html` using real AEM block
   markup (`<div class="$1"><div><div>…</div></div></div>`) so the block can be
   rendered without CMS content. Mention that the dev server needs
   `--html-folder drafts` to serve it.

7. **Report** the content contract, the files created, and the exact local URL
   to view it.
