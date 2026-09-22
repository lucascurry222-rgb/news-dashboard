// ============================================================
//  DOOMSDAY — the acceleration of AI, monitored
//  Fetches live headlines per sector, tags each source's
//  political lean, and shows a spectrum bar per sector.
// ============================================================

// 1) YOUR SECTORS. Each is a Google News search. `threat` (1 = hottest)
//    sets its board color. Edit `query` to retask a sector.
const FEEDS = [
  { code: "01", title: "Critical Mass", sub: "New AI models & research", threat: 2, query: 'new AI model OR "artificial intelligence" breakthrough' },
  { code: "02", title: "Fallout Index", sub: "AI & tech stocks",         threat: 3, query: 'Nvidia OR AI stocks OR semiconductor stocks' },
  { code: "03", title: "Rogue Actor",   sub: "Elon Musk",                threat: 3, query: 'Elon Musk' },
  { code: "04", title: "Fuel Rods",     sub: "Energy & rare earths",     threat: 3, query: 'rare earth minerals OR AI energy demand OR data center power' },
  { code: "05", title: "Flashpoint",    sub: "China / Taiwan & chips",   threat: 1, query: 'China Taiwan semiconductor OR chip export' },
  { code: "06", title: "Containment",   sub: "AI legislation",           threat: 3, query: 'AI regulation OR AI legislation OR AI executive order' },
  { code: "07", title: "The Oval",      sub: "Trump, AI-related only",   threat: 2, query: 'Trump AI OR Trump semiconductor OR Trump "artificial intelligence"' },
  { code: "08", title: "Dead Hand",     sub: "AI safety & existential risk", threat: 1, query: 'AI safety OR AI alignment OR superintelligence OR existential risk' },
];

// 2) MEDIA-BIAS MAP. Ratings reflect *common perception* (AllSides /
//    Ad Fontes-style consensus) and are approximate. Keys are outlet
//    names, normalized (lowercase, no "the", no .com). Codes:
//    L = left, LL = lean left, C = center, LR = lean right, R = right.
const LEANS = {
  L:  { code: "L",  label: "Left",       cls: "lean-L"  },
  LL: { code: "LL", label: "Lean left",  cls: "lean-LL" },
  C:  { code: "C",  label: "Center",     cls: "lean-C"  },
  LR: { code: "LR", label: "Lean right", cls: "lean-LR" },
  R:  { code: "R",  label: "Right",      cls: "lean-R"  },
  U:  { code: "U",  label: "Unrated",    cls: "lean-U"  },
};

const BIAS = {
  // Left
  "msnbc":"L","vox":"L","huffpost":"L","huffington post":"L","mother jones":"L",
  "slate":"L","intercept":"L","daily beast":"L","nation":"L","jacobin":"L","salon":"L",
  "alternet":"L","new republic":"L","rolling stone":"L","vanity fair":"L","atlantic":"L","buzzfeed news":"L",
  // Lean left
  "new york times":"LL","nytimes":"LL","cnn":"LL","washington post":"LL","nbc news":"LL","nbcnews":"LL",
  "cbs news":"LL","abc news":"LL","guardian":"LL","politico":"LL","npr":"LL","time":"LL","verge":"LL",
  "wired":"LL","techcrunch":"LL","ars technica":"LL","engadget":"LL","mashable":"LL","gizmodo":"LL",
  "business insider":"LL","insider":"LL","yahoo news":"LL","usa today":"LL","pbs":"LL","pbs newshour":"LL",
  "al jazeera":"LL","semafor":"LL","los angeles times":"LL","la times":"LL","boston globe":"LL","vice":"LL",
  "quartz":"LL","fast company":"LL","fastcompany":"LL","scientific american":"LL","the daily beast":"LL",
  // Center
  "reuters":"C","ap news":"C","associated press":"C","ap":"C","bbc":"C","bbc news":"C","financial times":"C",
  "ft":"C","forbes":"C","marketwatch":"C","cnbc":"C","bloomberg":"C","axios":"C","hill":"C","newsweek":"C",
  "christian science monitor":"C","csmonitor":"C","c span":"C","cspan":"C","economist":"C","fortune":"C",
  "south china morning post":"C","scmp":"C","taipei times":"C","nikkei":"C","kyodo":"C","barrons":"C",
  "yahoo finance":"C","simply wall st":"C","simplywall":"C","seeking alpha":"C","seekingalpha":"C",
  "benzinga":"C","thestreet":"C","morningstar":"C","nature":"C","science":"C","mit news":"C",
  "mit technology review":"C","ieee spectrum":"C","ieee":"C","new scientist":"C","phys org":"C","physorg":"C",
  "tech xplore":"C","register":"C","zdnet":"C","cnet":"C","venturebeat":"C","the information":"C","information":"C",
  "investopedia":"C","good news network":"C","upi":"C","the conversation":"C",
  // Lean right
  "wall street journal":"LR","wsj":"LR","new york post":"LR","nypost":"LR","ny post":"LR","daily mail":"LR",
  "telegraph":"LR","washington examiner":"LR","dispatch":"LR","reason":"LR","national interest":"LR",
  "realclearpolitics":"LR","real clear politics":"LR","spectator":"LR",
  // Right
  "fox news":"R","fox business":"R","foxnews":"R","breitbart":"R","daily wire":"R","national review":"R",
  "washington times":"R","newsmax":"R","epoch times":"R","daily caller":"R","federalist":"R","townhall":"R",
  "blaze":"R","oann":"R","one america news":"R","american conservative":"R","zerohedge":"R","zero hedge":"R",
  "just the news":"R","post millennial":"R","pjmedia":"R","western journal":"R","new york sun":"R",
};

function normOutlet(s) {
  return s.toLowerCase()
    .replace(/\.(com|org|net|io|st|tv|co|uk|us|au|ai)\b/g, "")
    .replace(/[’'".,]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^the /, "");
}
function leanOf(outlet) {
  if (!outlet) return LEANS.U;
  const code = BIAS[normOutlet(outlet)];
  return code ? LEANS[code] : LEANS.U;
}

// Google News titles come as "Headline - Publisher". Split them.
function splitPublisher(rawTitle) {
  const i = rawTitle.lastIndexOf(" - ");
  if (i > 0 && i > rawTitle.length - 55) {
    return { headline: rawTitle.slice(0, i).trim(), outlet: rawTitle.slice(i + 3).trim() };
  }
  return { headline: rawTitle.trim(), outlet: "" };
}

const board = document.getElementById("board");
const updatedEl = document.getElementById("updated");
const refreshBtn = document.getElementById("refresh");

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

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

// Turn a raw title + date into our story object (with lean tag).
function toStory(rawTitle, link, dateString) {
  const { headline, outlet } = splitPublisher(rawTitle || "Untitled");
  const mins = minutesAgo(dateString);
  return { headline, outlet, lean: leanOf(outlet), link: link || "#", when: timeAgo(mins), fresh: mins < 120 };
}

// Fetch one sector's stories (up to 25). Primary rss2json, backup allorigins.
async function fetchStories(feed) {
  const url = feedUrl(feed.query);
  try {
    const res = await fetchWithTimeout(
      "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url), 10000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.items)) {
        return data.items.slice(0, 25).map((it) => toStory(it.title, it.link, it.pubDate));
      }
    }
  } catch (err) { /* fall through */ }

  const res2 = await fetchWithTimeout(
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(url), 12000);
  if (!res2.ok) throw new Error("Backup failed (" + res2.status + ")");
  const xml = new DOMParser().parseFromString(await res2.text(), "text/xml");
  return [...xml.querySelectorAll("item")].slice(0, 25).map((node) =>
    toStory(node.querySelector("title")?.textContent, node.querySelector("link")?.textContent,
            node.querySelector("pubDate")?.textContent || ""));
}

function feedUrl(query) {
  return "https://news.google.com/rss/search?q=" + encodeURIComponent(query + " when:30d") +
         "&hl=en-US&gl=US&ceid=US:en";
}

// 3) Pick stories so BOTH sides of the aisle show up when available:
//    round-robin across left / right / center / unrated buckets.
function selectBalanced(stories, limit) {
  const left = [], right = [], center = [], unrated = [];
  for (const s of stories) {
    const c = s.lean.code;
    if (c === "L" || c === "LL") left.push(s);
    else if (c === "R" || c === "LR") right.push(s);
    else if (c === "C") center.push(s);
    else unrated.push(s);
  }
  const buckets = [left, right, center, unrated];
  const picked = [];
  let progress = true;
  while (picked.length < limit && progress) {
    progress = false;
    for (const b of buckets) {
      if (b.length) { picked.push(b.shift()); progress = true; if (picked.length >= limit) break; }
    }
  }
  return picked;
}

// Build the little stacked spectrum bar for a set of stories.
function spectrumBar(stories) {
  const order = ["L", "LL", "C", "LR", "R", "U"];
  const counts = {}; order.forEach((c) => (counts[c] = 0));
  stories.forEach((s) => counts[s.lean.code]++);
  const total = stories.length || 1;
  const segs = order.filter((c) => counts[c] > 0).map((c) =>
    `<i class="seg-${c}" style="width:${(counts[c] / total * 100).toFixed(1)}%" title="${counts[c]} ${LEANS[c].label}"></i>`
  ).join("");
  return `<div class="spectrum" title="Source lean mix for this sector">${segs}</div>`;
}

// 4) Build one sector column, then load & render its stories.
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
       <div class="spectrum-slot"></div>
     </div>
     <div class="col__body"><div class="state">Scanning&hellip;</div></div>`;
  board.appendChild(col);

  const body = col.querySelector(".col__body");
  try {
    const all = await fetchStories(feed);
    const sel = selectBalanced(all, 7);
    col.querySelector(".spectrum-slot").innerHTML = spectrumBar(sel);
    body.innerHTML = sel.map((s) =>
      `<div class="story">
         <a href="${s.link}" target="_blank" rel="noopener">${s.headline}</a>
         <div class="meta">
           ${s.outlet ? `<span class="outlet">${s.outlet}</span>` : ``}
           <span class="lean ${s.lean.cls}">${s.lean.label}</span>
           <span class="when${s.fresh ? " fresh" : ""}">${s.when}</span>
         </div>
       </div>`
    ).join("") || `<div class="state">No signal.</div>`;
  } catch (err) {
    body.innerHTML = `<div class="state">Feed dark. <button onclick="location.reload()">Retry</button></div>`;
  }
}

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

refreshBtn.addEventListener("click", loadAll);
startClock();
loadAll();
