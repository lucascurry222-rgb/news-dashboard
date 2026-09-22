// ============================================================
//  DOOMSDAY — the acceleration of AI, monitored
//  Fetches live headlines per sector and puts them on the board.
// ============================================================

// 1) YOUR SECTORS. Each is a Google News search, so it pulls fresh
//    articles on that theme from every outlet. Edit `query` to retask
//    a sector; `threat` (1 = hottest) sets its color on the board.
const FEEDS = [
  { code: "01", title: "Critical Mass", sub: "New AI models & research", threat: 2, query: 'new AI model OR "artificial intelligence" breakthrough' },
  { code: "02", title: "Fallout Index", sub: "AI & tech stocks",         threat: 3, query: 'Nvidia OR AI stocks OR semiconductor stocks' },
  { code: "03", title: "Rogue Actor",   sub: "Elon Musk",                threat: 3, query: 'Elon Musk' },
  { code: "04", title: "Fuel Rods",     sub: "Energy & rare earths",     threat: 3, query: 'rare earth minerals OR AI energy demand OR data center power' },
  { code: "05", title: "Flashpoint",    sub: "China / Taiwan & chips",   threat: 1, query: 'China Taiwan semiconductor OR chip export' },
  { code: "06", title: "Containment",   sub: "AI legislation",           threat: 3, query: 'AI regulation OR AI legislation OR AI executive order' },
  { code: "07", title: "The Oval",      sub: "Trump, AI-related only",   threat: 2, query: 'Trump AI OR Trump semiconductor OR Trump "artificial intelligence"' },
];

function feedUrl(query) {
  // "when:30d" keeps results to the last 30 days so the board stays fresh.
  return "https://news.google.com/rss/search?q=" + encodeURIComponent(query + " when:30d") +
         "&hl=en-US&gl=US&ceid=US:en";
}

const board = document.getElementById("board");
const updatedEl = document.getElementById("updated");
const refreshBtn = document.getElementById("refresh");

// 2) Age of a story in minutes (used for "fresh" flags and time text).
function minutesAgo(dateString) {
  const then = new Date(dateString);
  if (isNaN(then)) return Infinity;
  return Math.round((Date.now() - then) / 60000);
}
function timeAgo(mins) {
  if (!isFinite(mins)) return "";
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  return Math.round(hrs / 24) + "d ago";
}

// 3) A fetch that gives up after `ms` so a slow service can't freeze us.
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// 4) Fetch one sector's stories. Primary: rss2json. Backup: allorigins.
async function fetchStories(feed) {
  const url = feedUrl(feed.query);

  try {
    const res = await fetchWithTimeout(
      "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url), 10000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items)) {
        return data.items.slice(0, 7).map((it) => {
          const mins = minutesAgo(it.pubDate);
          return { title: (it.title || "Untitled").trim(), link: it.link || "#", when: timeAgo(mins), fresh: mins < 120 };
        });
      }
    }
  } catch (err) { /* fall through to backup */ }

  const res2 = await fetchWithTimeout(
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(url), 12000);
  if (!res2.ok) throw new Error("Backup failed (" + res2.status + ")");
  const xml = new DOMParser().parseFromString(await res2.text(), "text/xml");
  return [...xml.querySelectorAll("item")].slice(0, 7).map((node) => {
    const mins = minutesAgo(node.querySelector("pubDate")?.textContent || "");
    return {
      title: node.querySelector("title")?.textContent?.trim() || "Untitled",
      link: node.querySelector("link")?.textContent?.trim() || "#",
      when: timeAgo(mins),
      fresh: mins < 120,
    };
  });
}

// 5) Build one sector column, then load its stories into it.
async function renderColumn(feed) {
  const col = document.createElement("section");
  col.className = "column";
  col.setAttribute("data-threat", feed.threat);
  col.innerHTML =
    `<div class="col__head">
       <div class="col__meta">
         <span class="col__code">${feed.code}</span>
         <span class="col__chip">DEFCON ${feed.threat}</span>
       </div>
       <h2 class="col__title">${feed.title}</h2>
       <div class="col__sub">${feed.sub}</div>
     </div>
     <div class="col__body"><div class="state">Scanning&hellip;</div></div>`;
  board.appendChild(col);

  const body = col.querySelector(".col__body");
  try {
    const stories = await fetchStories(feed);
    body.innerHTML = stories.map((s) =>
      `<div class="story">
         <a href="${s.link}" target="_blank" rel="noopener">${s.title}</a>
         <div class="when${s.fresh ? " fresh" : ""}">${s.when}</div>
       </div>`
    ).join("") || `<div class="state">No signal.</div>`;
  } catch (err) {
    body.innerHTML = `<div class="state">Feed dark. <button onclick="location.reload()">Retry</button></div>`;
  }
}

// 6) Load every sector. Clear the board first so Re-scan works cleanly.
function loadAll() {
  board.innerHTML = "";
  refreshBtn.disabled = true;
  updatedEl.textContent = "Scanning all sectors…";

  const jobs = FEEDS.map(renderColumn);
  Promise.allSettled(jobs).then(() => {
    refreshBtn.disabled = false;
    updatedEl.textContent = "Last sweep " + new Date().toLocaleTimeString();
  });
}

// 7) The live UTC clock in the command bar.
function startClock() {
  const utc = document.getElementById("utc");
  if (!utc) return;
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const d = new Date();
    utc.textContent = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + " UTC";
  };
  tick();
  setInterval(tick, 1000);
}

// 8) Wire up controls and start.
refreshBtn.addEventListener("click", loadAll);
startClock();
loadAll();
