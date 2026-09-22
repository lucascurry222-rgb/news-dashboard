# Personal News Dashboard — project context

**What:** A dashboard that pulls together news and info Luke finds relevant.
**Audience:** Luke himself — this is the learning sandbox, no client to disappoint.
**Likely features:** fetch headlines from sources/APIs, display in a clean layout,
filter by topic.
**Why first:** Best starter project — teaches fetching data, displaying it, and
styling, with zero client pressure.

## Status
v2 built 2026-09-22. Renamed to **DOOMSDAY** — a war-room / doomsday-clock themed
AI-threat monitor. Stack: plain HTML/CSS/JS (no framework). 7 live sectors via
Google News + rss2json (30-day filter). Design: dark, Oswald/Inter/IBM Plex Mono,
amber/red palette, live UTC clock + "89 sec to midnight" motif, DEFCON threat
strip, per-sector threat coloring (Flashpoint = DEFCON 1 red).

Section renames: Capabilities->Critical Mass, Markets->Fallout Index,
Musk->Rogue Actor, Resources->Fuel Rods, Geopolitics->Flashpoint,
Policy->Containment, Trump->The Oval.

## Media-bias feature (built 2026-09-22)
- Each headline is tagged with its outlet's political lean using a ~90-outlet
  BIAS map in app.js (common-perception / AllSides-style: L/LL/C/LR/R, else
  Unrated). Outlet parsed from Google News "Headline - Publisher" titles.
- Each sector shows a stacked SPECTRUM bar of its lean mix; a legend explains colors.
- selectBalanced() round-robins across left/right/center/unrated so both sides
  appear per sector when the feed contains them.
- Known limitation: mainstream AI coverage skews center/lean-left, so some
  sectors surface few right-leaning or strong-partisan outlets — the bar shows
  this honestly rather than faking balance. To push more right-side coverage,
  add outlets to BIAS or add dedicated single-outlet feeds.

## Planned next
- (open) Consider dedicated per-outlet feeds to guarantee spectrum coverage.

## Working notes
_Update this file as decisions get made: stack, key features, client feedback,
current focus. This is the first thing to read when picking this project back up._
