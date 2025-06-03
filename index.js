import { initializeData } from "./init.js";
import { Datenquelle } from "./models.js";

let lastProjects = [];

function initFilter() {
    lastProjects = window.projektManager.getAll();
    lastProjects = lastProjects
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
        .slice(0, 3);
}

function showLastProjects() {
    const projectContainer = document.getElementById('lastProjectView');
    projectContainer.innerHTML = '';

    lastProjects.forEach(project => {
        const article = document.createElement('article');

        const h2 = document.createElement('h2');
        const a = document.createElement('a');
        a.href = project instanceof Datenquelle? `dataView/dataView.html?id=${project.id}`: `projectView/projectView.html?id=${project.id}`;
        a.textContent = project.title;
        h2.appendChild(a);

        const p = document.createElement('p');
        p.textContent = project.shortDescription;

        article.appendChild(h2);
        article.appendChild(p);
        projectContainer.appendChild(article);
    });
}

function startSearch(searchTxt) {
    let projects = window.projektManager.suche("title", searchTxt);
    let datasources = window.datenquellenManager.suche("title", searchTxt);
    let combinedResult = datasources.concat(projects);
    combinedResult.sort((a, b) => {
        if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
        if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
        return 0;
    });
    lastProjects = combinedResult.slice(0, 3);
    showLastProjects();
}


document.addEventListener('DOMContentLoaded', () => {
    initializeData(window['projects'], window['datasources']);
    initFilter();
    showLastProjects();
});


window.startSearch = startSearch;