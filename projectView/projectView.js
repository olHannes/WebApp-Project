import { initializeData } from "../init.js";

let projects = [];
let projectId = null;

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
            <span class="status" data-url="${dq.url ?? ''}">Status: noch nicht geprüft</span>
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
    const pLongDescription = projekt.longDescription ?? "Keine Langbeschreibung verfügbar";
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


async function checkSource(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return { url, status: response.status, ok: response.ok };
    } catch (error) {
        return { url, status: null, ok: false };
    }
}

async function checkAccess() {
    projectId = getProjectIdFromUrl();
    if (!projectId) return;

    const projekt = projects.find(p => String(p.id) === projectId);
    if (!projekt) return;

    const datenquellen = projekt.datenquellen;
    if (!datenquellen || datenquellen.length === 0) return;
    console.log(datenquellen);
    const checkPromises = datenquellen.map(dq => {
        return checkSource(dq.url ?? '').then(result => {
            return { id: dq.id, ...result };
        });
    });

    const results = await Promise.all(checkPromises);

    results.forEach(({ id, url, status, ok }) => {
        const statusSpan = document.querySelector(`.status[data-url="${url}"]`);
        if (statusSpan) {
            statusSpan.textContent = ok
                ? `Status: erreichbar (HTTP ${status})`
                : `Status: nicht erreichbar`;
            statusSpan.style.color = ok ? 'green' : 'red';
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    initializeData(window['projects'], window['datasources']);
    projects = window.projects;
    initFilter();
    checkAccess();
});