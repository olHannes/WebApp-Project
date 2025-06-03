function getProjectIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function initFilter() {
  const projectId = getProjectIdFromUrl();
  if (!projectId) return;

  const projects = window["projects"];

  const projekt = projects.find(p => String(p.id) === projectId);
  if (!projekt) {
    console.warn("Projekt nicht gefunden:", projectId);
    return;
  }
  console.log(projekt);

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

  //Datenquellen dynamisch anzeigen
}

document.addEventListener("DOMContentLoaded", initFilter);