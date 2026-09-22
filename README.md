# AI Dashboard

A personal dashboard that pulls live headlines about the advancement of AI,
organized by topic. Built with plain HTML, CSS, and JavaScript — no framework,
no build step.

## Topics (edit the `FEEDS` list in app.js to change these)
- Capabilities — new AI models & research
- Markets — AI & tech stocks
- Musk watch — Elon Musk
- Resources — energy & rare earth minerals
- Geopolitics — China / Taiwan & chips
- Policy — AI legislation
- Trump & AI — Trump news, AI-related only

## How it works
Each topic is a Google News search. The browser can't read those feeds directly
(a security rule called CORS), so a free service (rss2json, with allorigins as a
backup) fetches them for us — no API key required. Results are filtered to the
last 30 days so the board stays fresh.

## How to run it
From this folder, start a local server and open it in a browser:

    python3 -m http.server 8000

Then visit http://localhost:8000
