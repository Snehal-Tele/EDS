---
description: Print the local, preview, and production URLs for a content path
argument-hint: <content-path, e.g. /privacy or /drafts/table-v2>
---

Build the full set of environment URLs for the path `$1` in this project.

This repo is `Snehal-Tele/EDS`. Confirm the current branch with
`git branch --show-current`, then print:

- **Local dev:** `http://localhost:3000$1`
- **Branch preview:** `https://<branch>--EDS--Snehal-Tele.aem.page$1`
- **Production preview:** `https://main--EDS--Snehal-Tele.aem.page$1`
- **Production live:** `https://main--EDS--Snehal-Tele.aem.live$1`

Then note:
- the `.plain.html` and `.md` variants for inspecting backend markup
  (`curl http://localhost:3000$1.plain.html`)
- that the branch preview URL is what a pull request description must link to,
  or the PR will be rejected
- that preview environments only serve content an author has previewed; local
  serves your working copy's code against that same previewed content
