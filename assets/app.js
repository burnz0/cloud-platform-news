const state = { data: null, filter: "all", query: "", edition: null };

const statusClass = (status) => status.toLowerCase().replaceAll(" ", "-");
const formatDate = (date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));

function currentEdition(data) {
  const requested = new URLSearchParams(location.search).get("edition");
  return data.editions.find((edition) => edition.slug === requested) || data.editions[0];
}

function renderHeader(edition) {
  document.querySelector("#edition-date").textContent = formatDate(edition.date);
  document.querySelector("#edition-summary").textContent = edition.summary;
  document.querySelector("#read-time").textContent = `${edition.readTime} min read`;
  document.querySelector("#story-count").textContent = `${edition.items.length} updates`;
  document.querySelector("#issue-label").textContent = `LATEST BRIEFING · ISSUE ${String(edition.issue).padStart(2, "0")}`;

  const counts = edition.items.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {});
  document.querySelector("#action-count").textContent = counts["Act now"] || 0;
  document.querySelector("#evaluate-count").textContent = counts.Evaluate || 0;
  document.querySelector("#watch-count").textContent = counts.Watch || 0;
  document.querySelector("#source-count").textContent = new Set(edition.items.map((item) => item.sourceUrl).filter(Boolean)).size;
}

function renderStories() {
  const root = document.querySelector("#stories");
  const template = document.querySelector("#story-template");
  const query = state.query.trim().toLowerCase();
  const stories = state.edition.items.filter((item) => {
    const topicMatch = state.filter === "all" || item.topics.includes(state.filter);
    const queryMatch = !query || [item.title, item.summary, item.impact, ...item.topics].join(" ").toLowerCase().includes(query);
    return topicMatch && queryMatch;
  });

  root.replaceChildren();
  stories.forEach((item, index) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector("article");
    card.style.setProperty("--index", index);
    node.querySelector(".story-number").textContent = String(index + 1).padStart(2, "0");
    const tags = node.querySelector(".story-tags");
    item.topics.forEach((topic) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = topic;
      tags.append(tag);
    });
    const status = node.querySelector(".status");
    status.classList.add(statusClass(item.status));
    status.textContent = item.status;
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".story-summary").textContent = item.summary;
    node.querySelector(".impact p").textContent = item.impact;
    node.querySelector(".story-date").textContent = item.published ? `Published ${formatDate(item.published)}` : formatDate(state.edition.date);
    const link = node.querySelector(".source-link");
    if (item.sourceUrl) link.href = item.sourceUrl;
    else link.hidden = true;
    root.append(node);
  });
  document.querySelector("#empty-state").hidden = stories.length > 0;
}

function renderArchive(data) {
  const root = document.querySelector("#archive-list");
  data.editions.forEach((edition) => {
    const link = document.createElement("a");
    link.className = "archive-item";
    link.href = `?edition=${edition.slug}#briefing`;
    link.innerHTML = `<span>Issue ${String(edition.issue).padStart(2, "0")}</span><small>${formatDate(edition.date)}</small>`;
    root.append(link);
  });
}

async function init() {
  try {
    const response = await fetch("data/briefings.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    state.data = await response.json();
    state.edition = currentEdition(state.data);
    renderHeader(state.edition);
    renderStories();
    renderArchive(state.data);
  } catch (error) {
    document.querySelector("#stories").innerHTML = `<div class="empty-state">The briefing could not be loaded. Please try again shortly.</div>`;
    console.error(error);
  }
}

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  state.filter = button.dataset.filter;
  renderStories();
}));

document.querySelector("#search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderStories();
});

init();
