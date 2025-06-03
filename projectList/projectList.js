let articleList = [];

export function addProject(project) {
  const exists = articleList.some((p) => p.id === project.id);
  if (!exists) {
    articleList.push(project);
  }
}

export function showArticles() {
  const articleContainer = document.getElementById("articleView");
  articleContainer.innerHTML = "";

  articleList.forEach((project) => {
    const article = document.createElement("article");

    const header = document.createElement("header");
    const h2 = document.createElement("h2");
    const a = document.createElement("a");
    a.href = `../projectView/projectView.html?id=${project.id}`;
    a.textContent = project.title;
    h2.appendChild(a);
    header.appendChild(h2);

    const p = document.createElement("p");
    p.textContent = project.short_description;

    const span = document.createElement("span");
    span.className = "dataSource";
    span.textContent = `Projektleitung: ${project.manager_name} (${project.manager_email})`;

    const footer = document.createElement("footer");
    const small = document.createElement("small");
    const start = formatDate(project.start_date);
    const end = formatDate(project.end_date);
    small.textContent = `Zeitraum: ${start} – ${end}`;
    footer.appendChild(small);

    article.appendChild(header);
    article.appendChild(p);
    article.appendChild(span);
    article.appendChild(footer);

    articleContainer.appendChild(article);
  });
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("de-DE", { year: "numeric", month: "long" });
}

document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sortierung");
  const searchInput = document.querySelector('.filterbox input[type="text"]');

  sortSelect.addEventListener("change", updateView);
  searchInput.addEventListener("change", updateView);

  showArticles();
});

function updateView() {
  const sortKriterium = document.getElementById("sortierung").value;
  const suchbegriff = document
    .querySelector('.filterbox input[type="text"]')
    .value.trim()
    .toLowerCase();

  let filteredList = window['projects'];

  if (suchbegriff) {
    filteredList = filteredList.filter(
      (p) =>
        p.title.toLowerCase().includes(suchbegriff) ||
        p.short_description.toLowerCase().includes(suchbegriff) ||
        p.manager_name.toLowerCase().includes(suchbegriff) ||
        p.manager_email.toLowerCase().includes(suchbegriff)
    );
  }

  switch (sortKriterium) {
    case "Anfangsdatum":
      filteredList.sort(
        (a, b) => new Date(a.start_date) - new Date(b.start_date)
      );
      break;
    case "Restlaufzeit":
      filteredList.sort((a, b) => {
        const restA = new Date(a.end_date) - Date.now();
        const restB = new Date(b.end_date) - Date.now();
        return restA - restB;
      });
      break;
    case "Anzahl der Datenquellen":
      filteredList.sort(
        (a, b) => (b.datenquellen?.length || 0) - (a.datenquellen?.length || 0)
      );
      break;
  }
  articleList = filteredList;
  showArticles();
}
