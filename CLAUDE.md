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

## Planned next
- **Media-bias bar**: show where each source lands on the political spectrum.
  Caveat: Google News mixes outlets per column, so this needs either per-headline
  outlet tagging (map outlet -> known lean) or switching some sectors to
  single-outlet feeds. Discuss approach before building.

## Working notes
_Update this file as decisions get made: stack, key features, client feedback,
current focus. This is the first thing to read when picking this project back up._
