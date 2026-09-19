const state = { data: null, filter: "all", query: "", edition: null };

const statusClass = (status) => status.toLowerCase().replaceAll(" ", "-");
const formatDate = (date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));

function currentEdition(data) {
  const requested = new URLSearchParams(location.search).get("edition");
  return data.editions.find((edition) => edition.slug === requested) || data.editions[0];
}

function renderHeader(edition) {
  const isLaunchPreview = edition.issue === 0 && edition.items.length === 0;
  document.querySelector("#edition-date").textContent = formatDate(edition.date);
  document.querySelector("#edition-summary").textContent = edition.summary;
  document.querySelector("#read-time").textContent = isLaunchPreview ? "Starts Monday" : `${edition.readTime} min read`;
  document.querySelector("#story-count").textContent = `${edition.items.length} stories`;
  document.querySelector("#issue-label").textContent = isLaunchPreview ? "FIRST ISSUE PENDING" : `ISSUE ${String(edition.issue).padStart(2, "0")}`;

}

function renderStories() {
  const root = document.querySelector("#stories");
  const template = document.querySelector("#story-template");
  const query = state.query.trim().toLowerCase();
  const candidates = query
    ? state.data.editions.flatMap((edition) => edition.items.map((item) => ({ ...item, edition })))
    : state.edition.items.map((item) => ({ ...item, edition: state.edition }));
  const queryMatches = candidates.filter((item) => !query || [item.title, item.summary, item.impact, ...item.topics].join(" ").toLowerCase().includes(query));
  const availableTopics = new Set(queryMatches.flatMap((item) => item.topics));
  if (state.filter !== "all" && !availableTopics.has(state.filter)) state.filter = "all";

  document.querySelectorAll(".filter").forEach((button) => {
    const active = button.dataset.filter === state.filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.hidden = button.dataset.filter !== "all" && !availableTopics.has(button.dataset.filter);
  });

  const stories = queryMatches.filter((item) => state.filter === "all" || item.topics.includes(state.filter));

  document.querySelector("#section-title").textContent = query ? "Search results" : "This week’s developments";
  document.querySelector("#section-description").textContent = query
    ? "Across all published editions."
    : "Selected for architectural impact, urgency and operational reach.";

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
    node.querySelector(".story-date").textContent = item.published ? `Published ${formatDate(item.published)}` : formatDate(item.edition.date);
    const link = node.querySelector(".source-link");
    if (item.sourceUrl) link.href = item.sourceUrl;
    else link.hidden = true;
    root.append(node);
  });
  const emptyState = document.querySelector("#empty-state");
  emptyState.textContent = !query && state.edition.items.length === 0
    ? "The first edition will be published Monday at 08:00 Europe/Berlin."
    : query ? "No stories found." : "No stories match this topic.";
  emptyState.hidden = stories.length > 0;
}

function renderArchive(data) {
  const root = document.querySelector("#archive-list");
  const panel = document.querySelector("#archive");
  const layout = document.querySelector("#content-layout");
  const toolbar = document.querySelector(".toolbar");
  const archiveNav = document.querySelector("#archive-nav");
  const previousEditions = data.editions.filter((edition) => edition.issue > 0 && edition.slug !== state.edition.slug);
  root.replaceChildren();
  previousEditions.forEach((edition) => {
    const link = document.createElement("a");
    link.className = "archive-item";
    link.href = `?edition=${edition.slug}#briefing`;
    link.innerHTML = `<span>Issue ${String(edition.issue).padStart(2, "0")}</span><small>${formatDate(edition.date)}</small>`;
    root.append(link);
  });
  panel.hidden = previousEditions.length === 0;
  layout.classList.toggle("no-archive", previousEditions.length === 0);
  toolbar.classList.toggle("no-archive", previousEditions.length === 0);
  archiveNav.hidden = previousEditions.length === 0;
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
    document.querySelector("#stories").innerHTML = `<div class="empty-state">This edition could not be loaded. Please try again shortly.</div>`;
    console.error(error);
  }
}

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  state.filter = button.dataset.filter;
  renderStories();
}));

const searchBox = document.querySelector("#archive-search");
const searchToggle = document.querySelector("#search-toggle");
const searchInput = document.querySelector("#search");

searchToggle.addEventListener("click", () => {
  const open = searchBox.classList.toggle("open");
  searchToggle.setAttribute("aria-expanded", String(open));
  searchInput.disabled = !open;
  searchInput.setAttribute("aria-hidden", String(!open));
  if (open) searchInput.focus();
  else {
    searchInput.value = "";
    state.query = "";
    renderStories();
  }
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderStories();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") searchToggle.click();
});

init();
