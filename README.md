# DOOMSDAY

A personal dashboard tracking the accelerating risks around AI, organized by
sector. War-room theme with a doomsday clock, DEFCON threat coloring, and a
political-bias tag on every source. Plain HTML, CSS, and JavaScript — no
framework, no build step.

## Sectors (edit the `FEEDS` list in app.js to change these)
- 01 Critical Mass — new AI models & research
- 02 Fallout Index — AI & tech stocks
- 03 Rogue Actor — Elon Musk
- 04 Cold War — China, chips & rare earths
- 05 Containment — AI legislation
- 06 The Oval — Trump, AI-related only
- 07 Dead Hand — AI safety & existential risk
- 08 The Culling — AI & the job market

## How it works
Each sector is a Google News search, fetched through rss2json (allorigins as
backup) — no API key. Results are filtered to the last 30 days. Every headline's
outlet is tagged with a political lean (common-perception / AllSides-style), and
each sector shows a spectrum bar of its lean mix. Stories are chosen round-robin
across left/center/right so both sides appear when the feed has them.

Note: Google News RSS rejects some queries with multiple quoted phrases OR'd
together (returns a 500) — keep sector queries mostly unquoted.

## How to run it
From this folder:

    python3 -m http.server 8000

Then visit http://localhost:8000
