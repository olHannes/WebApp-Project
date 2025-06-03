import { initializeData } from "../init.js";

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
        p.textContent = project.shortDescription;

        const span = document.createElement("span");
        span.className = "dataSource";
        span.textContent = `Projektleitung: ${project.contactInfo.manager_name} (${project.contactInfo.manager_email})`;

        const footer = document.createElement("footer");
        const small = document.createElement("small");
        const start = formatDate(project.startDate);
        const end = formatDate(project.endDate);
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


function updateView() {
    const sortKriterium = document.getElementById("sortierung").value;
    const suchbegriff = document
        .querySelector('.filterbox input[type="text"]')
        .value.trim()
        .toLowerCase();

    let filteredList = window.projektManager.getAll();

    if (suchbegriff) {
        const suchbegriffLC = suchbegriff.toLowerCase();

        filteredList = filteredList.filter((p) =>
            p.title?.toLowerCase().includes(suchbegriffLC) ||
            p.shortDescription?.toLowerCase().includes(suchbegriffLC) ||
            p.contactInfo.manager_name?.toLowerCase().includes(suchbegriffLC) ||
            p.contactInfo.manager_email?.toLowerCase().includes(suchbegriffLC)
        );
    }
    switch (sortKriterium) {
        case "Anfangsdatum":
            window.projektManager.sortiereNach("start_date");
            break;
        case "Restlaufzeit":
            window.projektManager.sortiereNach("restlaufzeit");
            break;
        case "Anzahl der Datenquellen":
            window.projektManager.sortiereNach("anzahlDatenquellen", true);
            break;
    }
    articleList = filteredList;
    showArticles();
}


document.addEventListener("DOMContentLoaded", () => {
    initializeData(window['projects'], window['datasources']);

    articleList = window.projektManager.getAll();
    const sortSelect = document.getElementById("sortierung");
    const searchInput = document.querySelector('.filterbox input[type="text"]');

    sortSelect.addEventListener("change", updateView);
    searchInput.addEventListener("change", updateView);

    showArticles();
});