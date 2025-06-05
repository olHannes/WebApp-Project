import { initMap, showUserLocation, addDataPoint } from "./mapModule.js";
import { initChart, addDatasetToChart } from "./chartModule.js";
import { Datenquelle, Datensatz } from "../models.js";
import { initializeData, addRandDatasources } from "../init.js";



function showDatasource() {
    let tempDs = getDatasource();
    const DS = tempDs? tempDs[0]: null;

    if (!DS) {
        console.warn("Keine Datenquelle gefunden.");
        document.getElementById('map').style.display="none";
        return;
    }

    const dTitle = DS.title || "Kein Titel";
    const dShortDesc = DS.shortDescription || "Keine Kurzbeschreibung verfügbar";

    let formattedDate = "Unbekannt";
    try {
        const dUpdate = new Date(DS.updateDate);
        if (!isNaN(dUpdate)) {
            formattedDate = dUpdate.toLocaleDateString("de-DE", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }else {
            formattedDate = "--.--.----";
        }
    } catch (e) {
        console.warn("Ungültiges Datum:", DS.updateDate);
    }

    const dApi = DS.apiUrl || null;
    const dLicense = DS.license || "Nicht verfügbar";

    document.getElementById('DsTitle').innerText = dTitle;
    document.getElementById('DsShortDescription').innerText = dShortDesc;
    document.getElementById('DsDate').innerText = formattedDate;
    
    const elLink = document.getElementById('DsLink');
    if (elLink) {
        if (dApi) {
            elLink.href = dApi;
            elLink.innerText = "Zur Quelle";
            elLink.style.pointerEvents = "auto";
            elLink.style.color = "";
        } else {
            elLink.href = "#";
            elLink.innerText = "Keine Quelle verfügbar";
            elLink.style.pointerEvents = "none";
            elLink.style.color = "gray";
        }
    }
    document.getElementById('DsLicense').innerText = dLicense;

    const datasets = DS.datensaetze;
    if(datasets){
        renderExampleDataMap(datasets);
        renderExampleDataChart(datasets);
        renderExampleDataTable(datasets);
    }    
}

function renderExampleDataMap(datasets){
    let foundData = false;
    initMap();
    showUserLocation();

    datasets.forEach(element => {
        if(element.latitude)
            foundData=true;
        const popupText = `ID: ${element.id}, Temp.: ${element.attributes.temp.toFixed(2)}`;
        addDataPoint(element.latitude, element.longitude, popupText);
    });
    if(!foundData){
        document.getElementById('map').style.display="none";
    }
}

function renderExampleDataChart(datasets){
    initChart("Temperature (°C)");
    addDatasetToChart(datasets);

    const elem = document.querySelector("article footer");
    if(!elem) return;

    const tsString = datasets[datasets.length - 1].attributes.ts;
    const tsDate = new Date(tsString);

    let formattedDate;

    if (!isNaN(tsDate)) {
        formattedDate = tsDate.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } else {
        formattedDate = "--.--.----";
    }
    elem.innerText = "Datenstand: " + formattedDate;
}

function renderExampleDataTable(datasets) {
    const tableWrapper = document.querySelector(".tableWrapper");
    if (!tableWrapper) {
        console.error("Kein Element mit der Klasse 'tableWrapper' gefunden.");
        return;
    }

    tableWrapper.innerHTML = "";

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Datum", "Temperatur", "Feinstaub"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const maxRows = 5;
    const rowCount = Math.min(maxRows, datasets.length);

    for (let i = 0; i < rowCount; i++) {
        const data = datasets[i];
        const attrs = data.attributes;

        const date = new Date(attrs.route).toLocaleDateString("de-DE");
        const temp = `${Math.round(attrs.temp)}°C`;
        const pm2_5 = attrs.pm2_5 !== undefined ? `${Math.round(attrs.pm2_5)}%` : "n/a";

        const row = document.createElement("tr");

        [date, temp, pm2_5].forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
}



function getDatasourceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}


function getDatasource(){
    const currentId = getDatasourceIdFromURL();
    if(!currentId) return;

    const datasources = window.datenquellenManager;
    const searchDS = datasources.suche("id", currentId);
    return searchDS;
}


document.addEventListener("DOMContentLoaded", () => {
    initializeData(window['projects'], window['datasources']);
    addRandDatasources(window['datasets']);
    showDatasource();
});