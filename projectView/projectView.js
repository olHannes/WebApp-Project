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
    const pTitle = projekt.title ?? "Ohne Titel";
    const pShortDescription = projekt.shortDescription ?? "Keine Kurzbeschreibung verfügbar";
    const pLongDescription = projekt.long_description ?? "Keine Langbeschreibung verfügbar";
    const pManagerName = projekt.contactInfo.manager_name ?? "unbekannt";
    const pManagerEmail = projekt.contactInfo.manager_email ?? "unbekannt";

    const h1 = document.querySelector("header h1");
    if (h1) h1.textContent = pTitle;

    const kurzbeschreibung = document.querySelector("section:nth-of-type(2) p");
    if (kurzbeschreibung) kurzbeschreibung.textContent = pShortDescription;

    const langbeschreibung = document.querySelector("#langbeschreibung p");
    if (langbeschreibung) langbeschreibung.textContent = pLongDescription;

    const kontaktBlock = document.querySelector("#kontakt p");
    if (kontaktBlock) {
        kontaktBlock.innerHTML = `
      <span class="editable" contenteditable="true">${pManagerName}</span><br>
      <span class="editable" contenteditable="true">${pManagerEmail}</span>
    `;
    }
    renderDatenquellen(projekt.datenquellen);
}


document.addEventListener('DOMContentLoaded', () => {
    initializeData(window['projects'], window['datasources']);
    initFilter();
});