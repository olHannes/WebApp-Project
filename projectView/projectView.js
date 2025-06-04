import { initializeData } from "../init.js";

function getProjectIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


function renderDatenquellen(datenquellen) {
    const container = document.querySelector('#datenquellen .data-list');
    container.innerHTML = '';

    datenquellen.forEach(dq => {
        const li = document.createElement('li');

        const title = dq.title ?? 'Ohne Titel';
        const description = dq.shortDescription ?? 'Keine Kurzbeschreibung verfügbar';
        const updateDate = dq.updateDate instanceof Date && !isNaN(dq.updateDate)
            ? dq.updateDate.toLocaleDateString('de-DE')
            : 'Unbekannt';
        const id = dq.id;

        li.innerHTML = `
            <strong>${title}</strong><br />
            ${description}<br />
            <em>Aktualisiert: ${updateDate}</em><br />
            <a href="../dataView/dataView.html?id=${encodeURIComponent(id)}">Zur Anzeige</a>
        `;
        container.appendChild(li);
    });
}

function initFilter() {
    const projectId = getProjectIdFromUrl();
    if (!projectId) return;

    projects = window.projektManager.getAll();

    const projekt = projects.find(p => String(p.id) === projectId);
    if (!projekt) {
        console.warn("Projekt nicht gefunden:", projectId);
        return;
    }

    const h1 = document.querySelector("header h1");
    if (h1) h1.textContent = projekt.title;

    const kurzbeschreibung = document.querySelector("section:nth-of-type(2) p");
    if (kurzbeschreibung) kurzbeschreibung.textContent = projekt.short_description;

    const langbeschreibung = document.querySelector("#langbeschreibung p");
    if (langbeschreibung) langbeschreibung.textContent = projekt.long_descriptions;

    const kontaktBlock = document.querySelector("#kontakt p");
    if (kontaktBlock && projekt.manager_email && projekt.manager_name) {
        kontaktBlock.innerHTML = `
      <span class="editable" contenteditable="true">${projekt.manager_name ?? ""}</span><br>
      <span class="editable" contenteditable="true">${projekt.manager_email ?? ""}</span>
    `;
    }

    renderDatenquellen(projekt.datenquellen);
}


document.addEventListener('DOMContentLoaded', () => {
    initializeData(window['projects'], window['datasources']);
    initFilter();
});