const state = { data: null, filter: "all", edition: null };

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
  const stories = state.edition.items.filter((item) => {
    const topicMatch = state.filter === "all" || item.topics.includes(state.filter);
    return topicMatch;
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
  const emptyState = document.querySelector("#empty-state");
  emptyState.textContent = state.edition.items.length === 0
    ? "The first edition will be published Monday at 08:00 Europe/Berlin."
    : "No stories match this topic.";
  emptyState.hidden = stories.length > 0;
}

function renderArchive(data) {
  const root = document.querySelector("#archive-list");
  data.editions.filter((edition) => edition.issue > 0).forEach((edition) => {
    const link = document.createElement("a");
    link.className = "archive-item";
    link.href = `?edition=${edition.slug}#briefing`;
    link.innerHTML = `<span>Issue ${String(edition.issue).padStart(2, "0")}</span><small>${formatDate(edition.date)}</small>`;
    root.append(link);
  });
  if (!root.children.length) root.innerHTML = '<p class="archive-empty">No editions published yet.</p>';
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
  document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  state.filter = button.dataset.filter;
  renderStories();
}));

init();
