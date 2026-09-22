// ============================================================
//  AI Dashboard — the advancement of AI, at a glance
//  Fetches live headlines per topic and puts them on the page.
// ============================================================

// 1) YOUR TOPICS. Each one is a Google News search — so it pulls
//    fresh articles on that theme from every outlet, not just one.
//    To change a topic, edit its `query` (same words you'd type
//    into Google News). To add one, copy a line.
const FEEDS = [
  { category: "Capabilities", source: "New AI models & research", query: 'new AI model OR "artificial intelligence" breakthrough' },
  { category: "Markets",      source: "AI & tech stocks",         query: 'Nvidia OR AI stocks OR semiconductor stocks' },
  { category: "Musk watch",   source: "Elon Musk",                query: 'Elon Musk' },
  { category: "Resources",    source: "Energy & rare earths",     query: 'rare earth minerals OR AI energy demand OR data center power' },
  { category: "Geopolitics",  source: "China / Taiwan & chips",   query: 'China Taiwan semiconductor OR chip export' },
  { category: "Policy",       source: "AI legislation",           query: 'AI regulation OR AI legislation OR AI executive order' },
  { category: "Trump & AI",   source: "Trump, AI-related only",   query: 'Trump AI OR Trump semiconductor OR Trump "artificial intelligence"' },
];

// Build the Google News RSS URL for a topic's search words.
function feedUrl(query) {
  // "when:30d" tells Google News to prefer articles from the last 30 days,
  // so the board stays fresh instead of surfacing old-but-popular stories.
  return "https://news.google.com/rss/search?q=" + encodeURIComponent(query + " when:30d") +
         "&hl=en-US&gl=US&ceid=US:en";
}

const board = document.getElementById("board");
const updatedEl = document.getElementById("updated");
const refreshBtn = document.getElementById("refresh");

// 2) Turn a date into friendly text like "3h ago".
function timeAgo(dateString) {
  const then = new Date(dateString);
  if (isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.round(hrs / 24) + "d ago";
}

// 3) A fetch that gives up after `ms` milliseconds, so a slow
//    service can never freeze the page.
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 4) Fetch one topic and pull out its list of stories.
//    Primary: rss2json (turns the feed into clean JSON for us).
//    Backup:  allorigins (hands back the raw feed, which we parse).
async function fetchStories(feed) {
  const url = feedUrl(feed.query);

  // --- try rss2json first ---
  try {
    const res = await fetchWithTimeout(
      "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url), 10000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items)) {
        return data.items.slice(0, 7).map((it) => ({
          title: (it.title || "Untitled").trim(),
          link: it.link || "#",
          when: timeAgo(it.pubDate),
        }));
      }
    }
  } catch (err) { /* fall through to backup */ }

  // --- backup: allorigins raw feed ---
  const res2 = await fetchWithTimeout(
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(url), 12000);
  if (!res2.ok) throw new Error("Backup failed (" + res2.status + ")");
  const xml = new DOMParser().parseFromString(await res2.text(), "text/xml");
  return [...xml.querySelectorAll("item")].slice(0, 7).map((node) => ({
    title: node.querySelector("title")?.textContent?.trim() || "Untitled",
    link: node.querySelector("link")?.textContent?.trim() || "#",
    when: timeAgo(node.querySelector("pubDate")?.textContent || ""),
  }));
}

// 5) Build one column on the page for a topic, then load it.
async function renderColumn(feed) {
  const col = document.createElement("section");
  col.className = "column";
  col.innerHTML =
    `<h2>${feed.category}</h2>` +
    `<div class="source">${feed.source}</div>` +
    `<div class="state">Loading&hellip;</div>`;
  board.appendChild(col);

  try {
    const stories = await fetchStories(feed);
    const list = stories.map((s) =>
      `<div class="story">
         <a href="${s.link}" target="_blank" rel="noopener">${s.title}</a>
         <div class="when">${s.when}</div>
       </div>`
    ).join("");
    col.querySelector(".state").outerHTML = list || `<div class="state">No stories found.</div>`;
  } catch (err) {
    col.querySelector(".state").innerHTML =
      `Couldn't load. <button onclick="location.reload()">Retry</button>`;
  }
}

// 6) Load every topic. Clear the board first so Refresh works cleanly.
function loadAll() {
  board.innerHTML = "";
  refreshBtn.disabled = true;
  updatedEl.textContent = "Updating…";

  const jobs = FEEDS.map(renderColumn);
  Promise.allSettled(jobs).then(() => {
    refreshBtn.disabled = false;
    updatedEl.textContent = "Updated " + new Date().toLocaleTimeString();
  });
}

// 7) Wire up the Refresh button and load once on start.
refreshBtn.addEventListener("click", loadAll);
loadAll();
